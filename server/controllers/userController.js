import sql from "../config/db.js";


export const getUserCreations = async (req, res) => {
    try {
        // Your auth middleware sets req.userId
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const creations = await sql`
            SELECT *
            FROM creations
            WHERE user_id = ${userId}
            ORDER BY created_at DESC
        `;

        return res.status(200).json({
            success: true,
            creations
        });

    } catch (error) {
        console.error("Get user creations failed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch your creations."
        });
    }
};

export const getPublishedCreations = async (req, res)=>{
    try {

        const creations = await sql `SELECT * FROM creations WHERE publish = true ORDERED BY created_at DESC`

        return res.json({success : true, creations});

    } catch (error) {
        return res.json({success : false, message:error.message});
    }
}


export const toggleLikeCreation = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.body;

        const [creation] = await sql`
            SELECT * FROM creations WHERE id = ${id}
        `;

        if (!creation) {
            return res.json({
                success: false,
                message: "Creation not found"
            });
        }

        const currentLikes = creation.likes;
        const userIdStr = userId.toString();

        let updatedLikes;
        let message;

        if (currentLikes.includes(userIdStr)) {
            updatedLikes = currentLikes.filter(
                (user) => user !== userIdStr
            );
            message = 'Creation Unliked';
        } else {
            updatedLikes = [...currentLikes, userIdStr];
            message = 'Creation Liked';
        }

        const formattedArray = `{${updatedLikes.join(',')}}`;

        await sql`
            UPDATE creations
            SET likes = ${formattedArray}::text[]
            WHERE id = ${id}
        `;

        res.json({ success: true, message });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}; 

