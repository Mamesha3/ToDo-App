import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { 
getUserTodo, 
addTodo, 
updateUserTodo, 
todoCompleted, 
deleteTodo, 
shareTodo, 
unshareTodo, 
getSharedTodos,
getDueTodos
} from "../lib/api"
import { useToast } from "../component/Toast"

export const useGetUserTodo = (user: any) => {
    return useQuery({
        queryKey: ["user-todo", user?.id],
        queryFn: getUserTodo,
        enabled: !!user,
    })
}

export const useAddTodo = (user: any) => {
    const queryClient = useQueryClient()
    const { showToast } = useToast()

    return useMutation({
        mutationKey: ["add-todo"],
        mutationFn: (data: any) => addTodo(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-todo", user?.id] })
            queryClient.invalidateQueries({ queryKey: ["shared-todos", user?.id] })
            showToast('success', 'Todo Added', 'Your todo has been added successfully')
        }
    })
}

export const useUpdateTodo = (user: any) => {
    const queryClient = useQueryClient()
    const { showToast } = useToast()

    return useMutation({
        mutationKey: ["update-todo"],
        mutationFn: ({data, id}: {data: any, id: any}) => updateUserTodo({data, id}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-todo", user?.id] })
            queryClient.invalidateQueries({ queryKey: ["shared-todos", user?.id] })
            showToast('success', 'Todo Updated', 'Your todo has been updated successfully')
        }
    })
}

export const useTodoCompleted = (user: any) => {
    const queryClient = useQueryClient()
    const { showToast } = useToast()

    return useMutation({
        mutationKey: ["todo-completed"],
        mutationFn: (id: any) => todoCompleted(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-todo", user?.id] })
            queryClient.invalidateQueries({ queryKey: ["shared-todos", user?.id] })
            showToast('success', 'Status Changed', 'Todo status has been updated successfully')
        }
    })
}

export const useDeleteTodo = (user: any) => {
    const queryClient = useQueryClient()
    const { showToast } = useToast()

    return useMutation({
        mutationKey: ["delete-todo"],
        mutationFn: (id: any) => deleteTodo(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-todo", user?.id] })
            queryClient.invalidateQueries({ queryKey: ["shared-todos", user?.id] })
            showToast('success', 'Todo Deleted', 'Your todo has been deleted successfully')
        }
    })
}

export const useShareTodo = (user: any) => {
    const queryClient = useQueryClient()
    const { showToast } = useToast()

    return useMutation({
        mutationKey: ["share-todo"],
        mutationFn: ({ todoId, userId }: { todoId: number, userId: number }) => shareTodo(todoId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-todo", user?.id] })
            queryClient.invalidateQueries({ queryKey: ["shared-todos", user?.id] })
            showToast('success', 'Todo Shared', 'Your todo has been shared successfully')
        }
    })
}

export const useUnshareTodo = (user: any) => {
    const queryClient = useQueryClient()
    const { showToast } = useToast()

    return useMutation({
        mutationKey: ["unshare-todo"],
        mutationFn: ({ todoId, userId }: { todoId: number, userId: number }) => unshareTodo(todoId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-todo", user?.id] })
            queryClient.invalidateQueries({ queryKey: ["shared-todos", user?.id] })
            showToast('success', 'Todo Unshared', 'Your todo has been unshared successfully')
        }
    })
}

export const useGetSharedTodos = (user: any) => {
    return useQuery({
        queryKey: ["shared-todos", user?.id],
        queryFn: getSharedTodos,
        enabled: !!user,
    })
}

export const useGetDueTodos = (user: any) => {
    return useQuery({
        queryKey: ["due-todos", user?.id],
        queryFn: getDueTodos,
        enabled: !!user,
        refetchInterval: 60000, // Check every minute
    })
}