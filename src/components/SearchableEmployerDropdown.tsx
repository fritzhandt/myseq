import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Building, ChevronDown } from 'lucide-react';

interface SearchableEmployerDropdownProps {
  employers: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchableEmployerDropdown({ 
  employers, 
  value, 
  onChange, 
  placeholder = "All employers" 
}: SearchableEmployerDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredEmployers = employers.filter(employer =>
    employer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayValue = value === 'all' ? '' : value;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputClick = () => {
    setIsOpen(true);
    setSearchTerm(displayValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);
    
    // If input is empty, set to 'all'
    if (newValue === '') {
      onChange('all');
    }
  };

  const handleEmployerSelect = (employer: string) => {
    onChange(employer);
    setSearchTerm('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleAllEmployersSelect = () => {
    onChange('all');
    setSearchTerm('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={isOpen ? searchTerm : displayValue}
          onChange={handleInputChange}
          onClick={handleInputClick}
          className="pr-8"
        />
        <ChevronDown 
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          <div className="p-1">
            <div
              className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm"
              onClick={handleAllEmployersSelect}
            >
              All employers
            </div>
            {filteredEmployers.map((employer) => (
              <div
                key={employer}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm flex items-center gap-2"
                onClick={() => handleEmployerSelect(employer)}
              >
                <Building className="h-3 w-3" />
                {employer}
              </div>
            ))}
            {filteredEmployers.length === 0 && searchTerm && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No employers found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}