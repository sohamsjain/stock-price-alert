import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";

interface EditableScoreCellProps {
    value: number | null | undefined;
    onSave: (value: number) => void;
    placeholder?: string;
}

function EditableScoreCell({
    value,
    onSave,
    placeholder = "0.00",
}: EditableScoreCellProps) {

    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleEdit = () => {
        setIsEditing(true);
        setEditValue(value?.toString() || '');
    };

    const handleSave = () => {
        const numValue = parseFloat(editValue);

        // If empty and value was null, nothing changed
        if ((editValue === '' || isNaN(numValue)) && (value == null || value === undefined)) {
            setIsEditing(false);
            return;
        }

        // Only call onSave if changed
        if (!isNaN(numValue) && numValue >= 0 && numValue !== value) {
            onSave(numValue);
        }

        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditValue('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    if (isEditing) {
        return (
            <Input
                ref={inputRef}
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="py-1 px-2 h-6 max-w-12 !text-xs rounded focus-visible:ring-0 text-right text-primary selection:bg-muted-foreground/10 selection:text-primary text-left"
                placeholder={placeholder}
                min={0}
                max={10}
                step={1}
            />
        );
    }

    return (
        <div onClick={handleEdit} className="hover:bg-muted/70 py-1 px-2 -mx-2 rounded">
            <span className="font-normal text-sm text-primary hover:text-primary/80">
                {value} / 10
            </span>
        </div>
    );
}


export default EditableScoreCell;