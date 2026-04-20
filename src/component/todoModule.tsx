"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"


export default function AddToDo({ setIsAdding }: { setIsAdding: (value: boolean) => void }) {
    const handleAdd = () => {
        // Add your todo submission logic here
        setIsAdding(false)
    }

    return (
        <>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsAdding(false)}>
            <div className="rounded-2xl p-4 bg-white shadow-lg flex flex-col gap-4 w-96" onClick={(e) => e.stopPropagation()}>
               <div className="flex items-center justify-between">
                <h2>Add Todo</h2>
                <Button variant="ghost" className="cursor-pointer" size="icon" onClick={() => setIsAdding(false)}>
                  <X />
                </Button>
               </div>
               <Input placeholder="Enter Title"/>
               <Textarea placeholder="Enter Content"/>
               <Button onClick={handleAdd}>Add</Button>
            </div>
          </div>
        </>
    )
}