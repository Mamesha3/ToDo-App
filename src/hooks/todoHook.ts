import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { 
getUserTodo, 
addTodo, 
updateUserTodo, 
todoCompleted, 
deleteTodo 
} from "../lib/api"
import { useToast } from "../component/Toast"

export const useGetUserTodo = () => {
    return useQuery({
        queryKey: ["user-todo"],
        queryFn:getUserTodo,
    })
}

export const useAddTodo = () => {
    const queryClient = useQueryClient()
    const { showToast } = useToast()

    return useMutation({
        mutationKey: ["add-todo"],
        mutationFn: (data: any) => addTodo(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-todo"] })
            showToast('success', 'Todo Added', 'Your todo has been added successfully')
        }
    })
}

export const useUpdateTodo = () => {
    const queryClient = useQueryClient()
    const { showToast } = useToast()

    return useMutation({
        mutationKey: ["update-todo"],
        mutationFn: ({data, id}: {data: any, id: any}) => updateUserTodo({data, id}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-todo"] })
            showToast('success', 'Todo Updated', 'Your todo has been updated successfully')
        }
    })
}

export const useTodoCompleted = () => {
    const queryClient = useQueryClient()
    const { showToast } = useToast()

    return useMutation({
        mutationKey: ["todo-completed"],
        mutationFn: (id: any) => todoCompleted(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-todo"] })
            showToast('success', 'Status Changed', 'Todo status has been updated successfully')
        }
    })
}

export const useDeleteTodo = () => {
    const queryClient = useQueryClient()
    const { showToast } = useToast()

    return useMutation({
        mutationKey: ["delete-todo"],
        mutationFn: (id: any) => deleteTodo(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-todo"] })
            showToast('success', 'Todo Deleted', 'Your todo has been deleted successfully')
        }
    })
}