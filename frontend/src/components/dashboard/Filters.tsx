import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const Filters = () => {
    return (
        <div className="flex gap-4 mb-6">
            <Select defaultValue="2023-2027">
                <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="2023-2027">Batch 2023-2027</SelectItem>
                </SelectContent>
            </Select>

            <Select defaultValue="1">
                <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="1">Semester 1</SelectItem>
                </SelectContent>
            </Select>

            <Select>
                <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="math">Mathematics</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}

export default Filters