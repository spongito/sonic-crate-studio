
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarIcon, SlidersHorizontal } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface LibrarySearchProps {
  search: string;
  setSearch: (search: string) => void;
  dateRange: { from?: Date; to?: Date };
  setDateRange: (range: { from?: Date; to?: Date }) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

export function LibrarySearch({
  search,
  setSearch,
  dateRange,
  setDateRange,
  showFilters,
  setShowFilters,
}: LibrarySearchProps) {
  return (
    <div className="flex gap-2 w-full sm:w-auto">
      <Input
        placeholder="Search tracks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full sm:w-[300px]"
      />
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[140px]">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.from ? (
              format(dateRange.from, "LLL dd, y")
            ) : (
              "Pick a date"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange.from}
            selected={{ from: dateRange.from, to: dateRange.to }}
            onSelect={(range: any) => setDateRange(range)}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      <Button
        variant={showFilters ? "secondary" : "outline"}
        onClick={() => setShowFilters(!showFilters)}
      >
        <SlidersHorizontal className="h-4 w-4" />
      </Button>
    </div>
  );
}
