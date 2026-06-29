import { Button, Modal } from "@heroui/react"
import type { Feedback } from "../types/database"
import { CircleInfo } from '@gravity-ui/icons';
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";

function FeedbackRenderer({ feedback }: { feedback: Feedback }) {
    switch (feedback.type) {
        case 'text':
            return (
                <div className="prose">
                    <ReactMarkdown remarkPlugins={[remarkBreaks]}>{feedback.explanation}</ReactMarkdown>
                </div>
            )

        case 'image':
            return <img src={feedback.explanation} style={{ width: '100%' }} />

        default:
            return null
    }
}

export function Feedback({ feedback, buttonColor }: { feedback: Feedback; buttonColor: string }) {
    return (
        <div className="flex flex-row justify-between items-center gap-2 w-full">
            <div className={`flex-1 border p-4 rounded ${feedback.isCorrect ? "border-green-500" : "border-red-500"}`}>
                <p>{feedback.message}</p>
            </div>
            <Modal>
                <Button isIconOnly style={{ background: buttonColor ? buttonColor : undefined }} >
                    <CircleInfo />
                </Button>
                <Modal.Backdrop>
                    <Modal.Container placement="center">
                        <Modal.Dialog className="bg-[#F8F1E7]">
                            <Modal.CloseTrigger />
                            <Modal.Header>
                                <Modal.Heading className="text-center">Info</Modal.Heading>
                            </Modal.Header>
                            <Modal.Body>
                                <FeedbackRenderer feedback={feedback} />
                            </Modal.Body>
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            </Modal>
        </div>
    )
}