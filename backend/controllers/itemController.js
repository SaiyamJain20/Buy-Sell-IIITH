import Item from '../models/itemsModels.js';

// Get all items
export const getAllItems = async (req, res) => {
    console.log("Fetching all items...");
    try {
        const items = await Item.find();
        res.json(items);
    } catch (err) {
        res.status(400).json({ error: 'Error fetching items', details: err });
    }
};

// Add a new item
export const addItem = async (req, res) => {
    const { name, price, description, category } = req.body;

    // Validate request body
    if (!name || !price || !category) {
        return res.status(400).json({ error: 'Name, price, and category are required.' });
    }

    try {
        // Create the new item
        const newItem = new Item({
            name,
            price,
            description,
            category,
            sellerId: req.user.id, // Assign the seller ID from the token
        });

        // Save to the database
        const savedItem = await newItem.save();

        res.status(201).json({ message: 'Item added successfully.', item: savedItem });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add item.', details: error.message });
    }
};

// Search and filter items
export const searchFilterItems = async (req, res) => {
    const { query, categories, minPrice, maxPrice } = req.body;

    // Build the query object
    let filterQuery = {};

    // If query parameter is provided, add search conditions
    if (query) {
        filterQuery.$or = [
            { name: { $regex: query, $options: 'i' } }, // Case-insensitive search in name
            { description: { $regex: query, $options: 'i' } }, // Case-insensitive search in description
        ];
    }

    // If categories are provided, add category filter
    if (categories && Array.isArray(categories) && categories.length > 0) {
        filterQuery.category = { $in: categories };
    }

    // If price range is provided, add price filter
    if (minPrice !== undefined || maxPrice !== undefined) {
        filterQuery.price = {};
        if (minPrice !== undefined) {
            filterQuery.price.$gte = minPrice; // Minimum price filter
        }
        if (maxPrice !== undefined) {
            filterQuery.price.$lte = maxPrice; // Maximum price filter
        }
    }

    try {
        // Fetch items from the database based on the filter query
        const items = await Item.find(filterQuery);

        // If no items are found
        if (items.length === 0) {
            return res.status(404).json({ message: 'No items found matching your search and filters.' });
        }

        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Server error.', details: error.message });
    }
};

// Get item by ID
export const getItemById = async (req, res) => {
    const { id } = req.params; // Extract the ID from the URL parameter

    try {
        // Find the item by its unique ID
        const item = await Item.findById(id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found.' });
        }

        res.json(item);
    } catch (error) {
        res.status(500).json({ error: 'Server error.', details: error.message });
    }
};
