import { Badge, BadgeAnchor, Button, Modal, toast } from "@heroui/react"
import { Bulb } from '@gravity-ui/icons';
import type { Hint } from "../types/database";
import { AudioPlayer } from "./AudioPlayer";
import { useHint } from "../services/gameService";
import { useEffect, useState } from "react";

function HintRenderer({ hint }: { hint: Hint }) {
    switch (hint.type) {
        case 'text':
            return <p className="whitespace-pre-line">{hint.content}</p>

        case 'image':
            return <img src={hint.content} style={{ width: '100%' }} />

        case 'audio':
            return <AudioPlayer audioUrl={hint.content} />

        default:
            return null
    }
}

export function HintModal({
    hint,
    numberOfHints,
    usedHints,
    teamId
}: {
    hint: Hint | null;
    numberOfHints: number;
    usedHints: number;
    teamId: string;
}) {
    const [open, setOpen] = useState(false);
    const [hasUsedHintForThisQuestion, setHasUsedHintForThisQuestion] = useState(false);

    const remainingHints = numberOfHints - usedHints;

    useEffect(() => {
        setHasUsedHintForThisQuestion(false);
    }, [hint?.id]);

    const handleUseHint = async () => {
        if (remainingHints <= 0) {
            toast.warning("Je hebt geen hints meer!");
            return;
        }

        if (hasUsedHintForThisQuestion) {
            setOpen(true);
            return;
        }

        try {
            await useHint(teamId);
            setHasUsedHintForThisQuestion(true);
            setOpen(true);
        } catch (err) {
            console.error("Er ging iets mis!\n", err)
            toast.danger("Er ging iets mis!");
        }
    };

    if (!hint) return null;

    return (
        <Modal>
            <BadgeAnchor>
                <Button isIconOnly variant="primary" size="lg" isDisabled={usedHints >= 3} onPress={handleUseHint}>
                    <Bulb />
                </Button>
                <Badge className="bg-[#B71234] border-0 text-white" size="md">{numberOfHints - usedHints}</Badge>
            </BadgeAnchor>
            <Modal.Backdrop isOpen={open} onOpenChange={setOpen}>
                <Modal.Container placement="center">
                    <Modal.Dialog className="bg-[#F8F1E7]">
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Heading className="text-center">
                                Hint
                            </Modal.Heading>
                        </Modal.Header>
                        <Modal.Body>
                            <HintRenderer hint={hint} />
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    )
}