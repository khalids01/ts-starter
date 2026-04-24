import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { client } from "@/lib/client";
import { getOwnerSetupStatus } from "./api";

export const useOwnerInfo = () => {
    return useQuery({
        queryKey: queryKeys.owner.setupStatus(),
        queryFn: getOwnerSetupStatus,
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
            queryClient.invalidateQueries({ queryKey: queryKeys.owner.setupStatus() });
        },
    });
};
