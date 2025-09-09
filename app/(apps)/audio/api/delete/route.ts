import { NextResponse } from "next/server";
import s3 from "@/lib/clients/cloudflare";
import { createClient } from "@/lib/utils/supabase/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { revalidateTag } from "next/cache";

/**
 * API Route: Handles deletion of audio recordings and associated data.
 *
 * **Process:**
 * 1. Authenticates the user.
 * 2. Retrieves the recording details from the database.
 * 3. Deletes the audio file from cloud storage.
 * 4. Removes the recording entry from the database.
 * 5. Revalidates related cache tags for UI consistency.
 *
 * **Note:**
 * - Deletes both the physical file and database records.
 * - Cascading deletes should handle associated transcripts and summaries.
 * - Revalidates cache tags for recording, transcript, summary, and user's recordings list.
 *
 * @param {Request} request - The incoming request containing the recordingId.
 * @returns {Promise<NextResponse>} JSON response indicating success or failure.
 */
export async function POST(request: any) {
  const { recordingId } = await request.json();
  const supabase = await createClient();

  // Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id;

  if (!userId) {
    return NextResponse.json(
      { error: "You must be logged in to delete audio" },
      { status: 401 }
    );
  }

  // Retrieve recording details and verify ownership
  const { data: recording, error } = await supabase
    .from("recordings")
    .select("*")
    .eq("id", recordingId)
    .eq("user_id", userId)
    .single();

  if (error || !recording) {
    return NextResponse.json(
      { error: "Recording not found or access denied" },
      { status: 404 }
    );
  }

  // Prepare delete command for cloud storage
  const deleteCommand = new DeleteObjectCommand({
    Bucket: process.env.STORAGE_BUCKET,
    Key: recording.file_url.split(`${process.env.STORAGE_PUBLIC_URL}/`)[1],
  });

  try {
    // Delete file from cloud storage and database record
    await s3.send(deleteCommand);
    const { error: deleteError } = await supabase
      .from("recordings")
      .delete()
      .eq("id", recordingId)
      .eq("user_id", userId);

    if (deleteError) {
      throw new Error("Failed to delete from database");
    }

    // Revalidate cache tags
    revalidateTag(`recording_${recordingId}`);
    revalidateTag(`transcript_${recordingId}`);
    revalidateTag(`summary_${recordingId}`);
    revalidateTag(`user_${userId}_recordings`);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting recording:", error);
    return NextResponse.json(
      { error: "Failed to delete recording" },
      { status: 500 }
    );
  }
}
