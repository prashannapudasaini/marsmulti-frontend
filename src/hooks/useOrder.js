import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "../services/orderService";

export function useCODOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderPayload) => orderService.createCODOrder(orderPayload),
    onSuccess: () => {
      // Invalidate products query to reflect updated stock quantities automatically
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
}
