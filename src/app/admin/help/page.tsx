'use client';

import { useState, useMemo } from 'react';
import { 
  Search, ChevronDown, ChevronRight, 
  Store, Upload, FileText, Bell, BarChart, 
  ShoppingBag, Settings, Users, HelpCircle,
  CheckCircle2, AlertTriangle, Info, Zap,
  ArrowRight, ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface FAQItem {
  question: string;
  answer: string;
  steps?: string[];
  tips?: string[];
  link?: { text: string; href: string };
}

interface FAQCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  items: FAQItem[];
}

const helpData: FAQCategory[] = [
  {
    id: 'restaurants',
    title: 'Restaurant Management',
    icon: <Store className="w-5 h-5" />,
    color: 'emerald',
    description: 'Add, edit, and manage restaurant partners',
    items: [
      {
        question: 'How do I add a new restaurant?',
        answer: 'Adding a new restaurant is a simple 4-step process. You need the restaurant details and a CSV file containing their menu.',
        steps: [
          'Go to "Add Restaurant" from the sidebar or Dashboard',
          'Fill in restaurant details: Name, Address, Phone, Category, Cuisine types',
          'Upload the menu CSV file (format: itemName, category, price, vegNonVeg, description)',
          'Click "Create Restaurant" - it will be saved as a draft',
          'Go to Dashboard → Pending Reviews → Click "Review & Activate" to publish'
        ],
        tips: [
          'Prepare the menu CSV file beforehand using the template',
          'Double-check phone numbers - customers will call this number',
          'Set priority number to control display order on homepage'
        ],
        link: { text: 'Add Restaurant Now', href: '/admin/restaurants/new' }
      },
      {
        question: 'How do I edit an existing restaurant?',
        answer: 'You can edit restaurant details and update their menu from the Restaurants page.',
        steps: [
          'Go to "Restaurants" from the sidebar',
          'Find the restaurant you want to edit',
          'Click "Edit" button to view/modify details',
          'To update menu, go to "Upload Menus" and select the restaurant'
        ],
        link: { text: 'View Restaurants', href: '/admin/restaurants' }
      },
      {
        question: 'How do I temporarily close a restaurant?',
        answer: 'You can toggle a restaurant\'s open/close status without deleting it. This is useful for holidays or temporary closures.',
        steps: [
          'Go to "Restaurants" from the sidebar',
          'Find the restaurant in the list',
          'Click the "Open/Closed" toggle button',
          'Green = Open, Red = Closed'
        ],
        tips: [
          'Closed restaurants will show a "Currently Closed" banner to customers',
          'Customers cannot add items from closed restaurants to cart'
        ]
      },
      {
        question: 'How do I delete a restaurant?',
        answer: 'You can permanently delete a restaurant or archive it (hide from customers but keep data).',
        steps: [
          'Go to "Restaurants" from the sidebar',
          'Find the restaurant you want to remove',
          'Click "Archive" to hide it (reversible) OR "Delete" to permanently remove',
          'Confirm the action in the popup'
        ],
        tips: [
          'Archived restaurants can be restored by clicking "Set Live"',
          'Deleted restaurants cannot be recovered - all menu data is lost'
        ]
      },
      {
        question: 'What is restaurant priority?',
        answer: 'Priority determines the display order of restaurants on the homepage. Lower numbers appear first.',
        steps: [
          'Go to "Restaurants" from the sidebar',
          'Enter a number in the Priority column (1 = first, 2 = second, etc.)',
          'Click the green checkmark to save',
          'Restaurants without priority are sorted alphabetically after prioritized ones'
        ],
        tips: [
          'Use priority to feature popular or promoted restaurants',
          'Each priority number must be unique'
        ]
      }
    ]
  },
  {
    id: 'menus',
    title: 'Menu Management',
    icon: <Upload className="w-5 h-5" />,
    color: 'blue',
    description: 'Upload and update restaurant menus',
    items: [
      {
        question: 'How do I upload a new menu?',
        answer: 'Menus are uploaded as CSV files. Each row represents one menu item.',
        steps: [
          'Go to "Upload Menus" from the sidebar',
          'Select the restaurant from the dropdown',
          'Prepare your CSV file with columns: itemName, category, price, vegNonVeg, description',
          'Click "Choose File" and select your CSV',
          'Review the preview and click "Upload"',
          'Go to Dashboard → Pending Reviews → Publish the changes'
        ],
        tips: [
          'vegNonVeg must be exactly "Veg" or "Non-Veg"',
          'Price should be a number without currency symbol',
          'Category groups items together on the menu page'
        ],
        link: { text: 'Upload Menu', href: '/admin/upload' }
      },
      {
        question: 'What is the CSV format for menus?',
        answer: 'The CSV file must have specific columns in the correct format.',
        steps: [
          'Column 1: itemName - Name of the dish (e.g., "Chicken Biryani")',
          'Column 2: category - Category name (e.g., "Biryani", "Starters")',
          'Column 3: price - Price in rupees, number only (e.g., 180)',
          'Column 4: vegNonVeg - Must be "Veg" or "Non-Veg"',
          'Column 5: description - Optional description of the dish'
        ],
        tips: [
          'First row should be headers: itemName,category,price,vegNonVeg,description',
          'Use Excel or Google Sheets to create the CSV',
          'Save as "CSV UTF-8" format to support special characters'
        ]
      },
      {
        question: 'How do I update prices?',
        answer: 'To update prices, upload a new CSV with the updated prices. The entire menu will be replaced.',
        steps: [
          'Export or copy your existing menu data',
          'Update the prices in the CSV file',
          'Go to "Upload Menus" and upload the updated CSV',
          'Review and publish from Dashboard → Pending Reviews'
        ],
        tips: [
          'Always keep a backup of your menu CSV files',
          'You can update individual items by uploading the full menu with changes'
        ]
      },
      {
        question: 'Why is my menu showing "Pending Review"?',
        answer: 'Menu uploads go to a draft state first. This allows you to review changes before making them live.',
        steps: [
          'Go to Dashboard',
          'Look for the restaurant in "Pending Reviews" section',
          'Click "Review & Publish"',
          'Review the changes and click "Publish Changes"'
        ]
      }
    ]
  },
  {
    id: 'orders',
    title: 'Order Management',
    icon: <ShoppingBag className="w-5 h-5" />,
    color: 'orange',
    description: 'View and manage customer orders',
    items: [
      {
        question: 'How do I view orders?',
        answer: 'All orders are displayed in the Orders page with real-time status updates.',
        steps: [
          'Go to "Orders" from the sidebar',
          'Orders are sorted by date (newest first)',
          'Use filters to find specific orders',
          'Click on an order to see full details'
        ],
        link: { text: 'View Orders', href: '/admin/orders' }
      },
      {
        question: 'How do I change order status?',
        answer: 'You can update order status to keep customers informed about their delivery.',
        steps: [
          'Go to "Orders" from the sidebar',
          'Find the order you want to update',
          'Click on the status badge (e.g., "Pending")',
          'Select the new status from the dropdown',
          'Customer will receive a push notification automatically'
        ],
        tips: [
          'Status options: Pending → Confirmed → Delivered or Cancelled',
          'Customers see status updates in real-time in their order history'
        ]
      },
      {
        question: 'What do the order statuses mean?',
        answer: 'Each status represents a stage in the order fulfillment process.',
        steps: [
          'Pending - Order received, waiting for confirmation',
          'Confirmed - Order accepted, being prepared',
          'Delivered - Order has been delivered to customer',
          'Cancelled - Order was cancelled (by admin or customer)'
        ]
      }
    ]
  },
  {
    id: 'offers',
    title: 'Offers & Promotions',
    icon: <Zap className="w-5 h-5" />,
    color: 'purple',
    description: 'Create and manage special offers',
    items: [
      {
        question: 'How do I create a new offer?',
        answer: 'Offers appear on the homepage and can be combo deals or delivery discounts.',
        steps: [
          'Go to "Manage Offers" from the sidebar',
          'Click "Create New Offer"',
          'Select offer type: Combo Deal or Free Delivery',
          'Fill in details: dish name, prices, restaurant, dates',
          'Click "Create Offer"'
        ],
        tips: [
          'Set start and end dates to auto-activate/deactivate offers',
          'Combo offers show original and discounted prices',
          'Free delivery offers require minimum order value'
        ],
        link: { text: 'Manage Offers', href: '/admin/offers' }
      },
      {
        question: 'How do I deactivate an offer?',
        answer: 'You can temporarily disable offers without deleting them.',
        steps: [
          'Go to "Manage Offers"',
          'Find the offer in the list',
          'Click the toggle to deactivate',
          'The offer will be hidden from customers immediately'
        ]
      }
    ]
  },
  {
    id: 'notifications',
    title: 'Push Notifications',
    icon: <Bell className="w-5 h-5" />,
    color: 'yellow',
    description: 'Send notifications to customers',
    items: [
      {
        question: 'How do I send a push notification?',
        answer: 'You can send notifications to all users or specific users who have enabled notifications.',
        steps: [
          'Go to "Notifications" from the sidebar',
          'Enter notification title and message',
          'Select target: All Users, Specific User, or Topic',
          'Optionally add a link (e.g., /restaurants/cupsncrumbs)',
          'Click "Send Notification"'
        ],
        tips: [
          'Keep titles short (under 50 characters)',
          'Messages should be clear and actionable',
          'Use sparingly - too many notifications annoy users'
        ],
        link: { text: 'Send Notification', href: '/admin/notifications' }
      },
      {
        question: 'Why are notifications not being received?',
        answer: 'Push notifications require user permission and may be blocked by device settings.',
        steps: [
          'User must have allowed notifications when prompted',
          'Check if the user has a valid FCM token in the system',
          'iOS users must add the app to home screen for notifications',
          'Some browsers/devices may block notifications'
        ]
      }
    ]
  },
  {
    id: 'system',
    title: 'System Settings',
    icon: <Settings className="w-5 h-5" />,
    color: 'slate',
    description: 'Global settings and controls',
    items: [
      {
        question: 'How do I change the WhatsApp order number?',
        answer: 'The WhatsApp number is used for order confirmations and customer support.',
        steps: [
          'Go to Dashboard',
          'Find "System Controls" section',
          'Enter the new phone number (without country code)',
          'Click the save button'
        ],
        tips: [
          'Format: 10-digit number (e.g., 8695902696)',
          'This number receives all WhatsApp order messages'
        ]
      },
      {
        question: 'How do I force close/open all restaurants?',
        answer: 'Use the Global Restaurant Status to override individual restaurant settings.',
        steps: [
          'Go to Dashboard',
          'Find "Global Restaurant Status" in System Controls',
          'Select: Auto (Timer), Force OPEN, or Force CLOSED',
          'Auto follows the configured operating hours (9 AM - 9 PM)'
        ],
        tips: [
          'Use "Force CLOSED" for emergencies or holidays',
          'This overrides individual restaurant open/close settings'
        ]
      }
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics & Reports',
    icon: <BarChart className="w-5 h-5" />,
    color: 'pink',
    description: 'View business insights and data',
    items: [
      {
        question: 'How do I view sales data?',
        answer: 'The Analytics page shows order statistics, revenue, and trends.',
        steps: [
          'Go to "Analytics" from the sidebar',
          'View total orders, revenue, and customer count',
          'Data is fetched from Google Sheets in real-time'
        ],
        link: { text: 'View Analytics', href: '/admin/analytics' }
      },
      {
        question: 'Where is the raw data stored?',
        answer: 'All order and user data is stored in Google Sheets for easy access and backup.',
        steps: [
          'Orders are stored in the "Orders" sheet',
          'Users are stored in the "Users" sheet',
          'You can access the Google Sheet directly for advanced analysis'
        ]
      }
    ]
  }
];

const colorClasses: Record<string, { bg: string; text: string; border: string; light: string }> = {
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-200', light: 'bg-emerald-50' },
  blue: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-600', border: 'border-orange-200', light: 'bg-orange-50' },
  purple: { bg: 'bg-purple-500', text: 'text-purple-600', border: 'border-purple-200', light: 'bg-purple-50' },
  yellow: { bg: 'bg-yellow-500', text: 'text-yellow-600', border: 'border-yellow-200', light: 'bg-yellow-50' },
  slate: { bg: 'bg-slate-500', text: 'text-slate-600', border: 'border-slate-200', light: 'bg-slate-50' },
  pink: { bg: 'bg-pink-500', text: 'text-pink-600', border: 'border-pink-200', light: 'bg-pink-50' },
};

function FAQAccordion({ item, color }: { item: FAQItem; color: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const colors = colorClasses[color];

  return (
    <div className={`border ${colors.border} rounded-xl overflow-hidden transition-all ${isOpen ? 'shadow-md' : ''}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors ${isOpen ? colors.light : ''}`}
      >
        <span className="font-semibold text-slate-800 pr-4">{item.question}</span>
        {isOpen ? (
          <ChevronDown className={`w-5 h-5 ${colors.text} shrink-0`} />
        ) : (
          <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
        )}
      </button>
      
      {isOpen && (
        <div className="px-4 pb-4 space-y-4">
          <p className="text-slate-600">{item.answer}</p>
          
          {item.steps && (
            <div className="space-y-2">
              <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <ArrowRight className="w-4 h-4" /> Steps:
              </p>
              <ol className="space-y-2 ml-6">
                {item.steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className={`w-6 h-6 ${colors.bg} text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0`}>
                      {idx + 1}
                    </span>
                    <span className="text-slate-600 text-sm pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
          
          {item.tips && (
            <div className={`${colors.light} rounded-lg p-3 space-y-1`}>
              <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Info className="w-4 h-4" /> Tips:
              </p>
              <ul className="space-y-1 ml-6">
                {item.tips.map((tip, idx) => (
                  <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${colors.text} shrink-0 mt-0.5`} />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {item.link && (
            <Link
              href={item.link.href}
              className={`inline-flex items-center gap-2 px-4 py-2 ${colors.bg} text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity`}
            >
              {item.link.text}
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminHelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return helpData;
    
    const query = searchQuery.toLowerCase();
    return helpData.map(category => ({
      ...category,
      items: category.items.filter(item => 
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        item.steps?.some(s => s.toLowerCase().includes(query)) ||
        item.tips?.some(t => t.toLowerCase().includes(query))
      )
    })).filter(category => category.items.length > 0);
  }, [searchQuery]);

  const totalQuestions = helpData.reduce((acc, cat) => acc + cat.items.length, 0);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
          <HelpCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Admin Help Center
        </h1>
        <p className="text-slate-500 mt-2">
          Everything you need to know about managing Khazaana
        </p>
        <p className="text-sm text-slate-400 mt-1">
          {totalQuestions} questions across {helpData.length} categories
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search for help... (e.g., 'add restaurant', 'upload menu', 'order status')"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-lg shadow-sm"
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {helpData.slice(0, 4).map((category) => {
          const colors = colorClasses[category.color];
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
              className={`p-4 rounded-xl border ${colors.border} ${activeCategory === category.id ? colors.light : 'bg-white'} hover:shadow-md transition-all text-left`}
            >
              <div className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center text-white mb-2`}>
                {category.icon}
              </div>
              <p className="font-bold text-slate-800 text-sm">{category.title}</p>
              <p className="text-xs text-slate-500">{category.items.length} topics</p>
            </button>
          );
        })}
      </div>

      {/* Categories */}
      <div className="space-y-8">
        {filteredData.map((category) => {
          const colors = colorClasses[category.color];
          const isActive = activeCategory === null || activeCategory === category.id;
          
          if (!isActive && !searchQuery) return null;
          
          return (
            <div key={category.id} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                  {category.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{category.title}</h2>
                  <p className="text-sm text-slate-500">{category.description}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {category.items.map((item, idx) => (
                  <FAQAccordion key={idx} item={item} color={category.color} />
                ))}
              </div>
            </div>
          );
        })}
        
        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No results found for "{searchQuery}"</p>
            <p className="text-sm text-slate-400 mt-1">Try different keywords or browse categories above</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-100 rounded-2xl p-6 text-center">
        <p className="text-slate-600 font-medium">Still need help?</p>
        <p className="text-sm text-slate-500 mt-1">
          Contact the development team or check the technical documentation
        </p>
      </div>
    </div>
  );
}
