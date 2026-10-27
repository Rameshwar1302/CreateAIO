import { clerkClient, getAuth } from "@clerk/express";

export const auth = async (req, res, next) => {
    try {
        const { userId, has } = getAuth(req);

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const hasPremiumPlan = typeof has === 'function' ? await has({ plan: 'premium' }) : false;
        const user = await clerkClient.users.getUser(userId);

        const currentUsage = user.privateMetadata?.free_usage;

        if (!hasPremiumPlan && currentUsage !== undefined) {
            req.free_usage = currentUsage;
        } else {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: 0
                }
            });
            req.free_usage = 0;
        }

        req.userId = userId;
        req.plan = hasPremiumPlan ? 'premium' : 'free';
        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.json({ success: false, message: error.message });
    }
}