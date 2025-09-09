"use client";

import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@radix-ui/react-icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircledIcon } from "@radix-ui/react-icons";

interface YourFilesProps {
  recordings: any[];
}

const YourFiles: React.FC<YourFilesProps> = ({ recordings }) => {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedRecording, setSelectedRecording] = useState<any>(null);
  const itemsPerPage = 5;
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async (recordingId: string) => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch("/audio/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordingId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete recording");
      }

      toast({
        description: (
          <div className="flex flex-col gap-4 p-1">
            <div className="flex items-start gap-3">
              <CheckCircledIcon className="h-5 w-5 text-green-500 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-[15px]">Recording deleted successfully</p>
                <p className="text-sm text-muted-foreground">
                  The recording and its associated data have been removed
                </p>
              </div>
            </div>
          </div>
        ),
        duration: 5000,
      });
      
      setSelectedRecording(null);
      window.location.reload();
    } catch (error) {
      console.error("Error deleting recording:", error);
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete recording"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const sortedRecordings = [...recordings].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const totalPages = Math.ceil(sortedRecordings.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const currentRecordings = sortedRecordings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="px-4">
      <div className="space-y-1 mb-4 mt-4">
        <h4 className="text-sm font-medium leading-none">Your recordings</h4>
        <p className="text-sm text-muted-foreground">
          Find a list with your previous recordings below.
        </p>
      </div>

      {recordings && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="text-center">Uploaded</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentRecordings.map((recording: any) => (
                <TableRow key={recording.id}>
                  <TableCell>
                    <a
                      href={`/audio/${recording.id}`}
                      className="text-primary hover:underline"
                    >
                      {recording.title ?? "Untitled"}
                    </a>
                  </TableCell>
                  <TableCell className="text-center text-sm text-gray-500">
                    {formatDistanceToNow(new Date(recording.created_at))} ago
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          className="hover:bg-red-50 hover:text-red-500 flex items-center space-x-1"
                          variant="ghost"
                          onClick={() => setSelectedRecording(recording)}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[440px] p-8 border-none bg-white dark:bg-neutral-900 rounded-3xl shadow-lg">
                        {isDeleting ? (
                          <div className="space-y-6">
                            <div className="space-y-2 text-center">
                              <DialogTitle className="text-2xl font-semibold">
                                Deleting Recording
                              </DialogTitle>
                              <DialogDescription className="text-neutral-500 dark:text-neutral-400">
                                {deleteError ? (
                                  <div className="text-red-500">
                                    Error: {deleteError}
                                    <button
                                      onClick={() => setDeleteError(null)}
                                      className="block mx-auto mt-2 text-sm text-neutral-500 hover:text-neutral-700"
                                    >
                                      Try Again
                                    </button>
                                  </div>
                                ) : (
                                  "Please wait while we remove your recording..."
                                )}
                              </DialogDescription>
                            </div>

                            {!deleteError && (
                              <div className="flex flex-col items-center py-6">
                                <div className="relative mb-8">
                                  <div className="w-20 h-20 rounded-full border-[3px] border-neutral-100 dark:border-neutral-800"></div>
                                  <div className="absolute top-0 left-0 w-20 h-20 rounded-full border-[3px] border-t-red-500 animate-spin"></div>
                                </div>

                                <div className="w-full space-y-4">
                                  <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                      <span className="font-medium">
                                        Removing recording data
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="space-y-2 text-center">
                              <DialogTitle className="text-2xl font-semibold">
                                Delete Recording
                              </DialogTitle>
                              <DialogDescription className="text-neutral-500 dark:text-neutral-400">
                                Are you sure you want to delete "
                                {selectedRecording?.title ?? "Untitled"}"?
                              </DialogDescription>
                            </div>

                            <div className="flex justify-center py-6">
                              <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                                <TrashIcon className="w-10 h-10 text-red-500" />
                              </div>
                            </div>

                            <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-2xl text-sm text-neutral-600 dark:text-neutral-400">
                              <p>
                                This action cannot be undone. This will
                                permanently delete:
                              </p>
                              <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>The audio recording</li>
                                <li>Generated transcript</li>
                                <li>Summary and action items</li>
                              </ul>
                            </div>

                            <div className="flex justify-center gap-4 pt-2">
                              <button
                                onClick={() => setSelectedRecording(null)}
                                disabled={isDeleting}
                                className="flex-1 h-10 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-sm font-medium flex items-center justify-center"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() =>
                                  handleDelete(selectedRecording.id)
                                }
                                disabled={isDeleting}
                                className="flex-1 h-10 rounded-full bg-red-50 hover:bg-red-100 text-red-500 text-sm font-medium flex items-center justify-center"
                              >
                                <TrashIcon className="w-3 h-3 mr-1.5" />
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  className="hover:bg-primary/80 hover:text-white"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    className="hover:bg-primary/80 hover:text-white"
                    onClick={() => handlePageChange(i + 1)}
                    isActive={i + 1 === currentPage}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  className="hover:bg-primary/80 hover:text-white"
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default YourFiles;
