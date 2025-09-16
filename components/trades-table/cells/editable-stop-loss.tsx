import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/data/trades-config";
import { useEffect, useRef, useState } from "react";

interface EditableStopLossCellProps {
    value: number | null | undefined;
    onSave: (value: number) => void;
    placeholder?: string;
    formatValue?: (value: number) => string;
}

function EditableStopLossCell({
    value,
    onSave,
    placeholder = "0.00",
    formatValue = (v: number) => formatCurrency(v)
}: EditableStopLossCellProps) {

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
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="py-1 px-2 -mx-2 h-6 max-w-18 !text-xs rounded focus-visible:ring-0 text-right text-rose-700 selection:bg-muted-foreground/10 selection:text-rose-700"
                placeholder={placeholder}
            />
        );
    }

    return (
        <div onClick={handleEdit} className="hover:bg-muted/70 py-1 px-2 -mx-2 rounded">
            <span className="font-normal text-xs text-rose-700 hover:text-rose-700/80">
                {value ? formatValue(value) : '---'}
            </span>
        </div>
    );
}


export default EditableStopLossCell;