import { useState, useMemo } from 'react';
import { CONCEPTS, ConceptCategory } from '../data/conceptsData';
import { useProgress } from '../../progress/hooks/useProgress';

export function useConcepts() {
  const [selectedCategory, setSelectedCategory] = useState<ConceptCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const { isViewed } = useProgress();

  const filteredConcepts = useMemo(() => {
    let list = selectedCategory === 'ALL' ? CONCEPTS : CONCEPTS.filter(c => c.category === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => c.title.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q) || c.tags.some(t => t.includes(q)));
    }
    return list;
  }, [selectedCategory, searchQuery]);

  return {
    concepts: filteredConcepts,
    totalConcepts: CONCEPTS.length,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    isViewed,
  };
}
