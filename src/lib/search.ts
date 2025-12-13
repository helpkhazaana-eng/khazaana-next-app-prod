import { getAllRestaurants } from '@/lib/restaurant-manager';
import { getMenu } from '@/lib/data-access';
import type { MenuItem, Restaurant } from '@/types';

export type SearchResultType = 'restaurant' | 'dish';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string; // Price for dish, Cuisine/Category for restaurant
  image?: string;   // Optional image logic if we had images
  url: string;      // /restaurants/id or /restaurants/id?dish=name
  restaurantId: string;
  matchScore?: number;
}

class TrieNode {
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;
  results: Set<string>; // Store IDs of results matching this prefix

  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.results = new Set();
  }
}

export class SearchEngine {
  private root: TrieNode;
  private items: Map<string, SearchResult>;
  private initialized: boolean = false;

  constructor() {
    this.root = new TrieNode();
    this.items = new Map();
  }

  async init() {
    if (this.initialized) return;

    // Get all public (live) restaurants
    const restaurants = await getAllRestaurants(false);

    // 1. Index Restaurants
    for (const restaurant of restaurants) {
      // Priority boost: items with lower priority number get higher boost
      // If priority is 1, boost is high. If undefined, boost is 0.
      const priorityBoost = restaurant.priority ? 100 / restaurant.priority : 0;
      
      const result: SearchResult = {
        id: `r-${restaurant.id}`,
        type: 'restaurant',
        title: restaurant.name,
        subtitle: `${restaurant.category} • ${restaurant.address}`,
        url: `/restaurants/${restaurant.id}`,
        restaurantId: restaurant.id,
        matchScore: priorityBoost // Initial base score based on priority
      };
      this.items.set(result.id, result);
      this.insert(restaurant.name, result.id);
      this.insert(restaurant.category, result.id);
      restaurant.cuisine.forEach(c => this.insert(c, result.id));
    }

    // 2. Index Menu Items
    // We need to load all menus. Since this runs on server/build, we can await.
    // Note: getMenu reads from file system.
    const promises = restaurants.map(async (r) => {
      const menu = await getMenu(r.id);
      menu.forEach((item, idx) => {
        // Create unique ID for the dish
        const id = `d-${r.id}-${idx}`;
        const result: SearchResult = {
          id,
          type: 'dish',
          title: item.itemName,
          subtitle: `₹${item.price} • ${r.name}`,
          url: `/restaurants/${r.id}#category-${item.category.replace(/\s+/g, '-').toLowerCase()}`, // Deep link to category
          restaurantId: r.id
        };
        
        this.items.set(id, result);
        this.insert(item.itemName, id);
        // We can also index category of the dish
        this.insert(item.category, id);
      });
    });

    await Promise.all(promises);
    this.initialized = true;
  }

  private insert(text: string, resultId: string) {
    // Normalize: lowercase, remove special chars
    const tokens = text.toLowerCase().split(/[\s,.-]+/);
    
    for (const token of tokens) {
      if (!token) continue;
      let node = this.root;
      for (const char of token) {
        if (!node.children.has(char)) {
          node.children.set(char, new TrieNode());
        }
        node = node.children.get(char)!;
        node.results.add(resultId); // Add result ID to this node (prefix match)
      }
      node.isEndOfWord = true;
    }
  }

  search(query: string, limit: number = 20): SearchResult[] {
    if (!query || query.length < 2) return [];
    
    const normalizedQuery = query.toLowerCase().trim();
    const tokens = normalizedQuery.split(/\s+/);
    
    if (tokens.length === 0) return [];

    // Intersection of results for all tokens (AND logic)
    // Actually for better UX, let's do union of prefix matches but score them?
    // Let's stick to: Find matches for the LAST token as prefix, and previous tokens as full word or prefix?
    // Simplest robust logic for "Biryani":
    // Traverse the Trie for "biryani". Get all results.
    
    // Let's handle single token query nicely first
    // For multi-word "Chicken Biryani", we might search "chicken" AND "biryani"
    
    let candidateIds: Set<string> | null = null;

    for (const token of tokens) {
        let node = this.root;
        let tokenIds = new Set<string>();
        let found = true;

        for (const char of token) {
            if (node.children.has(char)) {
                node = node.children.get(char)!;
            } else {
                found = false;
                break;
            }
        }

        if (found) {
            // Collect all result IDs from this node and below (since it's a prefix)
            // But we optimized by storing results in the node itself during insertion!
            // Wait, my insert logic `node.results.add(resultId)` adds the ID to EVERY node along the path.
            // So `node.results` contains all items that have a word starting with the path to this node.
            tokenIds = node.results;
        }

        if (candidateIds === null) {
            candidateIds = tokenIds;
        } else {
            // Intersection
            const currentCandidates: string[] = Array.from(candidateIds);
            const filtered = currentCandidates.filter((x) => tokenIds.has(x));
            candidateIds = new Set(filtered);
        }
        
        if (candidateIds.size === 0) return [];
    }

    if (!candidateIds) return [];

    // Map IDs to results
    const results = Array.from(candidateIds).map(id => this.items.get(id)!);

    // Sort priority: Match Score (Priority) -> Restaurants -> Dishes -> Alphabetical
    return results.sort((a, b) => {
        // Higher match score first
        if ((a.matchScore || 0) !== (b.matchScore || 0)) {
            return (b.matchScore || 0) - (a.matchScore || 0);
        }
        
        if (a.type !== b.type) {
            return a.type === 'restaurant' ? -1 : 1;
        }
        return a.title.localeCompare(b.title);
    }).slice(0, limit);
  }
}

// Global instance to reuse index across requests in dev (in prod serverless it might re-init)
// We use a global variable to cache it.
const globalForSearch = global as unknown as { searchEngine: SearchEngine };

export const searchEngine = globalForSearch.searchEngine || new SearchEngine();

if (process.env.NODE_ENV !== 'production') globalForSearch.searchEngine = searchEngine;
