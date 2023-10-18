"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";

function UploadButton() {
	const [isOpen, setIsOpen] = useState(false);
	return (
		<div>
			<Dialog
				open={isOpen}
				onOpenChange={(v) => {
					if (!v) {
						setIsOpen(v);
					}
				}}
			>
				<DialogTrigger onClick={() => setIsOpen(true)} asChild>
					<Button>Upload PDF</Button>
				</DialogTrigger>

				<DialogContent>
					{/* <UploadDropzone isSubscribed={isSubscribed} /> */}
					example content
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default UploadButton;
