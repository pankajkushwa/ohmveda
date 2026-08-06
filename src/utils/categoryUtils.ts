import { StoreCategory, StoreItem } from '../types';

export interface CategoryTreeNode extends StoreCategory {
  subcategories: CategoryTreeNode[];
}

/**
 * Builds a 3-level nested tree from flat array of StoreCategory items
 */
export function buildCategoryTree(categories: StoreCategory[]): CategoryTreeNode[] {
  if (!categories || !Array.isArray(categories)) return [];

  // Identify Level 0 (top-level / main) categories
  const level0 = categories.filter(
    (c) => !c.parentId || c.level === 0 || c.level === undefined
  );

  return level0.map((mainCat) => {
    // Find Level 1 subcategories under this main category
    const subcats = categories.filter(
      (c) => c.parentId === mainCat.id || (c.level === 1 && c.parentId === mainCat.id)
    );

    const subTree: CategoryTreeNode[] = subcats.map((subCat) => {
      // Find Level 2 sub-subcategories under this subcategory
      const subSubcats = categories.filter(
        (c) => c.parentId === subCat.id || (c.level === 2 && c.parentId === subCat.id)
      );

      return {
        ...subCat,
        level: 1,
        subcategories: subSubcats.map((ssc) => ({
          ...ssc,
          level: 2,
          subcategories: [],
        })),
      };
    });

    return {
      ...mainCat,
      level: 0,
      subcategories: subTree,
    };
  });
}

/**
 * Gets all category IDs that belong to a category (itself + all descendant subcategories & sub-subcategories)
 */
export function getAllChildCategoryIds(catId: string, categories: StoreCategory[]): string[] {
  if (!catId || catId === 'all') return ['all'];

  const result: string[] = [catId];

  // Find direct children (Level 1)
  const level1Children = categories.filter((c) => c.parentId === catId);
  level1Children.forEach((child) => {
    result.push(child.id);
    // Find Level 2 children
    const level2Children = categories.filter((c) => c.parentId === child.id);
    level2Children.forEach((grandChild) => {
      result.push(grandChild.id);
    });
  });

  return result;
}

/**
 * Gets parent breadcrumb chain for a given category ID
 */
export function getCategoryBreadcrumbChain(
  catId: string,
  categories: StoreCategory[]
): StoreCategory[] {
  if (!catId || catId === 'all') return [];

  const current = categories.find((c) => c.id === catId);
  if (!current) return [];

  const chain: StoreCategory[] = [current];

  if (current.parentId) {
    const parent = categories.find((c) => c.id === current.parentId);
    if (parent) {
      chain.unshift(parent);
      if (parent.parentId) {
        const grandParent = categories.find((c) => c.id === parent.parentId);
        if (grandParent) {
          chain.unshift(grandParent);
        }
      }
    }
  }

  return chain;
}

/**
 * Checks if a store item matches a selected category ID (or any of its child categories)
 */
export function itemMatchesCategoryFilter(
  item: StoreItem,
  selectedCategory: string,
  categories: StoreCategory[]
): boolean {
  if (!item) return false;
  if (!selectedCategory || selectedCategory === 'all') return true;

  const validCatIds = getAllChildCategoryIds(selectedCategory, categories);
  const validCatIdsLower = validCatIds.map((id) => id.trim().toLowerCase());

  const validCatLabelsLower = categories
    .filter((c) => validCatIds.includes(c.id))
    .map((c) => (c.label || '').trim().toLowerCase());

  const itemCatLower = (item.category || '').trim().toLowerCase();
  const itemSubCatLower = (item.subCategory || '').trim().toLowerCase();
  const itemSubSubCatLower = (item.subSubCategory || '').trim().toLowerCase();

  return (
    validCatIdsLower.includes(itemCatLower) ||
    validCatIdsLower.includes(itemSubCatLower) ||
    validCatIdsLower.includes(itemSubSubCatLower) ||
    (itemCatLower !== '' && validCatLabelsLower.includes(itemCatLower)) ||
    (itemSubCatLower !== '' && validCatLabelsLower.includes(itemSubCatLower)) ||
    (itemSubSubCatLower !== '' && validCatLabelsLower.includes(itemSubSubCatLower))
  );
}

/**
 * Counts how many products belong to a category or any of its subcategories
 */
export function getCategoryProductCount(
  catId: string,
  categories: StoreCategory[],
  products: StoreItem[]
): number {
  if (!products || !Array.isArray(products)) return 0;
  if (catId === 'all') return products.length;

  return products.filter((p) => itemMatchesCategoryFilter(p, catId, categories)).length;
}
