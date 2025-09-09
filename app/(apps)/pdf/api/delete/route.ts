import { NextRequest, NextResponse } from "next/server";
import s3 from "@/lib/clients/cloudflare";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@/lib/utils/supabase/server";
import { authMiddleware } from "@/lib/middleware/authMiddleware";
import { revalidateTag } from "next/cache";

/**
 * API Route: Handles PDF document deletion.
 *
 * **Features:**
 * - Deletes PDF files from cloud storage
 * - Removes document metadata from database
 * - Handles authentication and authorization
 * - Cleans up associated resources
 * - Revalidates cache tags for UI consistency
 *
 * **Process:**
 * 1. Authenticates the user
 * 2. Retrieves document metadata from database
 * 3. Deletes file from cloud storage
 * 4. Removes database entries
 * 5. Revalidates related cache tags
 *
 * **Security:**
 * - Requires user authentication
 * - Validates document ownership
 * - Ensures complete cleanup of all resources
 *
 * @param {NextRequest} request - Contains documentId for deletion
 * @returns {Promise<NextResponse>} Confirmation of successful deletion
 */
export async function POST(request: NextRequest) {
  // Authenticate user
  const authResponse = await authMiddleware(request);
  if (authResponse.status === 401) return authResponse;

  const supabase = await createClient();
  const { documentId } = await request.json();

  // Get the user ID properly from Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 }
    );
  }

  // Retrieve document metadata and verify ownership
  const { data: document, error } = await supabase
    .from("pdf_documents")
    .select("file_url")
    .eq("id", documentId)
    .eq("user_id", userId)
    .single();

  if (error || !document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // Prepare cloud storage deletion
  const deleteCommand = new DeleteObjectCommand({
    Bucket: process.env.STORAGE_BUCKET,
    Key: document.file_url.split(`${process.env.STORAGE_PUBLIC_URL}/`)[1],
  });

  try {
    // Delete from cloud storage and database
    await s3.send(deleteCommand);
    await supabase
      .from("pdf_documents")
      .delete()
      .eq("id", documentId)
      .eq("user_id", userId);

    // Revalidate cache tags with correct userId
    revalidateTag(`pdf_document_${documentId}`);
    revalidateTag(`user_${userId}_pdf_documents`);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
