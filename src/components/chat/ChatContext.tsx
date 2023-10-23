import { createContext, ReactNode, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useMutation } from "@tanstack/react-query";

interface ContextType {
	addMessage: () => void;
	message: string;
	handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
	isLoading: boolean;
}

export const ChatContext = createContext<ContextType>({
	addMessage: () => {},
	message: "",
	handleInputChange: () => {},
	isLoading: false,
});

interface Props {
	fileId: string;
	children: ReactNode;
}

export const ChatContextProvider = ({ fileId, children }: Props) => {
	const [message, setMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const { toast } = useToast();

	const { mutate: sendMessage } = useMutation({
		mutationFn: async ({ message }: { message: string }) => {
			const response = await fetch("/api/message", {
				method: "POST",
				body: JSON.stringify({
					fileId,
					message,
				}),
			});

			if (!response.ok) {
				throw new Error("failed to send message");
			}

			return response.body;
		},
	});

	const addMessage = () => sendMessage({ message });

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setMessage(e.target.value);
	};

	return (
		<ChatContext.Provider
			value={{
				addMessage,
				message,
				handleInputChange,
				isLoading,
			}}
		>
			{children}
		</ChatContext.Provider>
	);
};
