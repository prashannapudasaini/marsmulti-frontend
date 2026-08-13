import React, { useState, useMemo } from "react";
import { Search, Download, Filter, ChevronUp, ChevronDown, Check, Eye, SlidersHorizontal, ArrowLeft, ArrowRight, CheckSquare, Square } from "lucide-react";
import { SkeletonLoader } from "./SkeletonLoader";
import { EmptyState } from "./EmptyState";

export const DataTable = ({
  columns = [],
  data = [],
  isLoading = false,
  onRowClick,
  searchPlaceholder = "Search records...",
  emptyTitle = "No records found",
  emptyDescription = "Adjust filters or search criteria to view data.",
  actionLabel,
  onAction,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  customFilters,
  exportFileName = "mars_multi_admin_export.csv"
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [columnVisibility, setColumnVisibility] = useState(() => {
    const initial = {};
    columns.forEach((col) => { initial[col.key] = col.visible !== false; });
    return initial;
  });
  const [showColDropdown, setShowColDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Toggle column visibility
  const toggleColumn = (key) => {
    setColumnVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredAndSortedData = useMemo(() => {
    let list = [];
    if (Array.isArray(data)) {
      list = data.slice();
    } else if (data && typeof data === "object" && Array.isArray(data.items)) {
      list = data.items.slice();
    } else if (data && typeof data === "object" && Array.isArray(data.data)) {
      list = data.data.slice();
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter((row) =>
        Object.values(row).some((val) =>
          val !== null && val !== undefined && val.toString().toLowerCase().includes(term)
        )
      );
    }

    // Sorting
    if (sortField) {
      list.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === "string" && typeof valB === "string") {
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        valA = valA ?? 0;
        valB = valB ?? 0;
        return sortAsc ? valA - valB : valB - valA;
      });
    }

    return list;
  }, [data, searchTerm, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedData.length / itemsPerPage));
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(start, start + itemsPerPage);
  }, [filteredAndSortedData, currentPage, itemsPerPage]);

  const handleSort = (key, sortable) => {
    if (sortable === false) return;
    if (sortField === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(key);
      setSortAsc(true);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (filteredAndSortedData.length === 0) return;
    const visibleCols = columns.filter((c) => columnVisibility[c.key]);
    const headers = visibleCols.map((c) => c.header).join(",") + "\n";
    const rows = filteredAndSortedData.map((row) =>
      visibleCols.map((c) => {
        const raw = row[c.key] !== undefined && row[c.key] !== null ? row[c.key].toString() : "";
        return `"${raw.replace(/"/g, '""')}"`;
      }).join(",")
    ).join("\n");

    const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", exportFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Selection logic
  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    if (selectedIds.length === currentData.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(currentData.map((d) => d.id));
    }
  };

  const handleSelectRow = (id, e) => {
    e.stopPropagation();
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((item) => item !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  if (isLoading) {
    return <SkeletonLoader rows={6} columns={columns.length || 4} />;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
      {/* Top Controls Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {customFilters && <div className="flex items-center gap-2">{customFilters}</div>}

          {/* Column Visibility Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowColDropdown(!showColDropdown)}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl flex items-center gap-2 shadow-2xs transition"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Columns
            </button>
            {showColDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-2 space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Toggle Columns</div>
                {columns.map((col) => (
                  <label key={col.key} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={!!columnVisibility[col.key]}
                      onChange={() => toggleColumn(col.key)}
                      className="rounded text-slate-900 focus:ring-0 w-3.5 h-3.5 border-slate-300"
                    />
                    <span className="truncate">{col.header}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* CSV Export Button */}
          <button
            onClick={exportToCSV}
            disabled={filteredAndSortedData.length === 0}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl flex items-center gap-2 shadow-2xs transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table Data Matrix */}
      <div className="overflow-x-auto min-h-[350px]">
        {currentData.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} actionLabel={actionLabel} onAction={onAction} />
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/70">
                {selectable && (
                  <th className="p-4 w-10 text-center">
                    <button onClick={handleSelectAll} className="text-slate-400 hover:text-slate-700 focus:outline-hidden">
                      {selectedIds.length > 0 && selectedIds.length === currentData.length ? (
                        <CheckSquare className="w-4 h-4 text-slate-900" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                )}
                {columns.filter((c) => columnVisibility[c.key]).map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key, col.sortable)}
                    className={`py-3.5 px-4 font-bold select-none ${
                      col.sortable !== false ? "cursor-pointer hover:text-slate-900" : ""
                    } ${col.align === "right" ? "text-right" : "text-left"}`}
                  >
                    <div className={`flex items-center gap-1.5 ${col.align === "right" ? "justify-end" : ""}`}>
                      <span>{col.header}</span>
                      {sortField === col.key && (
                        sortAsc ? <ChevronUp className="w-3.5 h-3.5 text-slate-900" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-900" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {currentData.map((row, rIdx) => {
                const isSelected = selectedIds.includes(row.id);
                return (
                  <tr
                    key={row.id || rIdx}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`hover:bg-slate-50/80 transition-colors ${onRowClick ? "cursor-pointer" : ""} ${
                      isSelected ? "bg-indigo-50/40" : ""
                    }`}
                  >
                    {selectable && (
                      <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button onClick={(e) => handleSelectRow(row.id, e)} className="text-slate-400 hover:text-slate-900 focus:outline-hidden">
                          {isSelected ? <CheckSquare className="w-4 h-4 text-slate-900" /> : <Square className="w-4 h-4" />}
                        </button>
                      </td>
                    )}
                    {columns.filter((c) => columnVisibility[c.key]).map((col) => (
                      <td key={col.key} className={`py-4 px-4 ${col.align === "right" ? "text-right font-medium text-slate-900" : ""}`}>
                        {col.render ? col.render(row[col.key], row) : row[col.key] ?? "-"}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer & Pagination */}
      {filteredAndSortedData.length > 0 && (
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/40">
          <div>
            Showing <span className="font-semibold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
            <span className="font-semibold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)}</span> of{" "}
            <span className="font-semibold text-slate-900">{filteredAndSortedData.length}</span> results
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 disabled:opacity-40 transition shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 font-semibold text-slate-800">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 disabled:opacity-40 transition shadow-2xs"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
