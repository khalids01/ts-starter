import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";

export const useOwnerInfo = () => {
    return useQuery({
        queryKey: ["owner-status"],
        queryFn: async () => {
            const { data, error } = await client.owner["setup-status"].get();
            if (error) {
                throw new Error((error.value as any)?.error || "Failed to check owner status");
            }
            return data;
        },
        refetchOnWindowFocus: false,
    });
};

export const useCreateOwner = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (variables: any) => {
            const { data, error } = await client.owner.setup.post(variables);
            if (error) {
                throw new Error((error.value as any)?.error || "Failed to create owner");
            }
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["owner-status"] });
        },
    });
};
