
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LibrarySearch } from "./LibrarySearch";
import { LibraryFilters } from "./LibraryFilters";

interface LibraryTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  search: string;
  setSearch: (value: string) => void;
  dateRange: { from?: Date; to?: Date };
  setDateRange: (range: { from?: Date; to?: Date }) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  bpmRange: [number, number];
  onBpmChange: (range: [number, number]) => void;
  yearRange: [number, number];
  onYearChange: (range: [number, number]) => void;
  genre: string;
  onGenreChange: (genre: string) => void;
  keySignature: string;
  onKeyChange: (key: string) => void;
}

export function LibraryTabs({
  activeTab,
  onTabChange,
  search,
  setSearch,
  dateRange,
  setDateRange,
  showFilters,
  setShowFilters,
  bpmRange,
  onBpmChange,
  yearRange,
  onYearChange,
  genre,
  onGenreChange,
  keySignature,
  onKeyChange,
}: LibraryTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="all">All Tracks</TabsTrigger>
            <TabsTrigger value="liked">Liked</TabsTrigger>
          </TabsList>

          <LibrarySearch
            search={search}
            setSearch={setSearch}
            dateRange={dateRange}
            setDateRange={setDateRange}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
          />
        </div>

        <LibraryFilters
          showFilters={showFilters}
          bpmRange={bpmRange}
          onBpmChange={onBpmChange}
          yearRange={yearRange}
          onYearChange={onYearChange}
          genre={genre}
          onGenreChange={onGenreChange}
          keySignature={keySignature}
          onKeyChange={onKeyChange}
        />
      </div>
    </Tabs>
  );
}
