import { useState, useRef, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { timeframes } from "@/data/trades-config";

interface EditableTimeframeCellProps {
    value: string | null | undefined;
    onSave: (value: string) => void;
}

function EditableTimeframeCell({
    value,
    onSave
}: EditableTimeframeCellProps) {
    const [isEditing, setIsEditing] = useState(false);

    const handleSelect = (newValue: string) => {
        if (newValue === value) {
            setIsEditing(false);
            return;
        }
        onSave(newValue);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <Select open={isEditing} onValueChange={handleSelect}>
                <SelectTrigger className="!h-6 w-18 text-xs">
                    <SelectValue placeholder={value || "Select"} />
                </SelectTrigger>
                <SelectContent>
                    {timeframes.map((timeframe) => (
                        <SelectItem key={timeframe.value} value={timeframe.value} className="text-muted-foreground text-xs font-normal">
                            {timeframe.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        );
    }

    return (
        <div onClick={() => setIsEditing(true)}>
            {value ? (
                <Badge variant="secondary" className="text-xs font-normal rounded text-primary hover:text-primary hover:bg-primary/20 px-2 py-1 cursor-pointer">
                    {value}
                </Badge>
            ) : (
                <span className="text-primary cursor-pointer">-</span>
            )}
        </div>
    );
}

export default EditableTimeframeCell;