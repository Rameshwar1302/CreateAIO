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

export const getPublishedCreations = async (req, res) => {
    try {
        const creations = await sql`
            SELECT
                id,
                user_id,
                prompt,
                content,
                type,
                publish,
                likes,
                created_at
            FROM creations
            WHERE publish = TRUE
              AND type = 'image'
            ORDER BY created_at DESC
        `;

        return res.status(200).json({
            success: true,
            creations
        });

    } catch (error) {
        console.error(
            "Get published creations failed:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch public creations."
        });
    }
};


export const toggleLikeCreation = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized."
            });
        }

        if (id === undefined || id === null || id === '') {
            return res.status(400).json({
                success: false,
                message: "Creation ID is required."
            });
        }

        // Toggle the like atomically to avoid overwriting
        // another user's concurrent update.
        const [updated] = await sql`
            UPDATE creations
            SET likes = CASE
                WHEN ${userId} = ANY(
                    COALESCE(likes, ARRAY[]::text[])
                )
                THEN array_remove(
                    COALESCE(likes, ARRAY[]::text[]),
                    ${userId}
                )
                ELSE array_append(
                    COALESCE(likes, ARRAY[]::text[]),
                    ${userId}
                )
            END
            WHERE id = ${id}
              AND publish = TRUE
              AND type = 'image'
            RETURNING likes
        `;

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Public image not found."
            });
        }

        const likes = updated.likes || [];
        const liked = likes.includes(userId);

        return res.status(200).json({
            success: true,
            liked,
            likes,
            message: liked
                ? "Creation liked."
                : "Creation unliked."
        });

    } catch (error) {
        console.error("Toggle like failed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to update like."
        });
    }
};

