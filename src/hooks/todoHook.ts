import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { 
getUserTodo, 
addTodo, 
updateUserTodo, 
todoCompleted, 
deleteTodo 
} from "../lib/api"

export const useGetUserTodo = () => {
    return useQuery({
        queryKey: ["user-todo"],
        queryFn:getUserTodo,
    })
}

export const useAddTodo = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ["add-todo"],
        mutationFn: (data: any) => addTodo(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-todo"] })
        }
    })
}

export const useUpdateTodo = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ["update-todo"],
        mutationFn: ({data, id}: {data: any, id: any}) => updateUserTodo({data, id}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-todo"] })
        }
    })
}

export const useTodoCompleted = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ["todo-completed"],
        mutationFn: (id: any) => todoCompleted(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-todo"] })
        }
    })
}

export const useDeleteTodo = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ["delete-todo"],
        mutationFn: (id: any) => deleteTodo(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-todo"] })
        }
    })
}