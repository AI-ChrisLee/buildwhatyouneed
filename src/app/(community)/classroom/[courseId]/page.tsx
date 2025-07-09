"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Cookies from 'js-cookie'
import { Button } from "@/components/ui/button"
import { 
  ChevronLeft, 
  MoreHorizontal, 
  ChevronDown, 
  ChevronRight,
  Plus,
  GripVertical,
  Folder,
  FileText,
  Copy,
  Trash2,
  Edit2,
  Check,
  Menu,
  X
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { RichTextEditor } from "@/components/rich-text-editor"
import { Switch } from "@/components/ui/switch"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { LessonContent } from "@/components/lesson-content"

interface Module {
  id: string
  title: string
  order_index: number
  is_collapsed: boolean
}

interface Lesson {
  id: string
  module_id: string | null
  title: string
  content: string | null
  order_index: number
  is_draft?: boolean
}

interface LessonCompletion {
  lesson_id: string
  completed_at: string
}

interface Course {
  id: string
  title: string
  description: string | null
  is_draft: boolean
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string
  const supabase = createClient()

  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null)
  const [editingLesson, setEditingLesson] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState("")
  const [editingTitle, setEditingTitle] = useState("")
  const [editingDraft, setEditingDraft] = useState(false)
  const [saving, setSaving] = useState(false)
  const [completions, setCompletions] = useState<LessonCompletion[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    loadCourseData()
  }, [courseId])

  async function loadCourseData() {
    try {
      // Check if user is admin
      let userIsAdmin = false
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        const { data: userData } = await supabase
          .from('users')
          .select('is_admin')
          .eq('id', user.id)
          .single()
        
        userIsAdmin = userData?.is_admin || false
        setIsAdmin(userIsAdmin)

        // Load user's completions
        const { data: completionsData } = await supabase
          .from('lesson_completions')
          .select('lesson_id, completed_at')
          .eq('user_id', user.id)

        setCompletions(completionsData || [])
      }

      // Load course
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single()

      if (courseData) {
        // Check if user can view this course
        if (courseData.is_draft && !userIsAdmin) {
          // Non-admin trying to access draft course
          router.push('/classroom')
          return
        }
        
        // Check course access for non-free courses
        if (!courseData.is_free && !userIsAdmin) {
          // Check if user has paid membership or active subscription
          if (user) {
            const { data: userData } = await supabase
              .from('users')
              .select('membership_tier')
              .eq('id', user.id)
              .single()
            
            const { data: subscription } = await supabase
              .from('stripe_subscriptions')
              .select('id')
              .eq('user_id', user.id)
              .eq('status', 'active')
              .limit(1)
              .single()
            
            const hasPaidAccess = userData?.membership_tier === 'paid' || !!subscription
            
            if (!hasPaidAccess) {
              // Redirect to classroom with message
              router.push('/classroom?upgrade=true')
              return
            }
          } else {
            // No user logged in, redirect to classroom
            router.push('/classroom?upgrade=true')
            return
          }
        }
        
        setCourse(courseData)
      }

      // Load modules
      const { data: modulesData } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index')

      setModules(modulesData || [])

      // Load lessons - filter out drafts for non-admins
      let lessonsQuery = supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index')
      
      // Non-admins should only see published lessons
      if (!userIsAdmin) {
        lessonsQuery = lessonsQuery.eq('is_draft', false)
      }
      
      const { data: lessonsData } = await lessonsQuery

      setLessons(lessonsData || [])
      
      // Auto-select first lesson or last viewed lesson
      if (lessonsData && lessonsData.length > 0) {
        // Check for last viewed lesson in cookie
        const cookieKey = `last-lesson-${courseId}`
        const lastViewedLessonId = Cookies.get(cookieKey)
        
        if (lastViewedLessonId && lessonsData.find(l => l.id === lastViewedLessonId)) {
          // Set the last viewed lesson if it exists
          setSelectedLesson(lastViewedLessonId)
        } else {
          // Otherwise, select the first lesson
          const firstLesson = lessonsData
            .sort((a, b) => a.order_index - b.order_index)[0]
          setSelectedLesson(firstLesson.id)
        }
      }
    } catch (error) {
      console.error('Error loading course:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddModule() {
    const title = prompt("Enter folder name:")
    if (!title) return

    const { data, error } = await supabase
      .from('course_modules')
      .insert({
        course_id: courseId,
        title,
        order_index: modules.length,
        is_collapsed: false
      })
      .select()
      .single()

    if (data) {
      setModules([...modules, data])
    }
  }

  async function handleAddLesson(moduleId: string | null = null) {
    const title = "New page"
    
    const { data, error } = await supabase
      .from('lessons')
      .insert({
        course_id: courseId,
        module_id: moduleId,
        title,
        content: "",
        order_index: lessons.filter(l => l.module_id === moduleId).length,
        wistia_video_id: null,
        description: null
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding lesson:', error)
      alert('Failed to add lesson. Please try again.')
      return
    }

    if (data) {
      setLessons([...lessons, data])
      setSelectedLesson(data.id)
      setEditingLesson(data.id)
      setEditingContent(data.content || "")
      setEditingTitle(data.title)
    }
  }

  async function handleSaveLesson(lessonId: string) {
    setSaving(true)
    const lesson = lessons.find(l => l.id === lessonId)
    if (!lesson) {
      setSaving(false)
      return
    }

    const { data, error } = await supabase
      .from('lessons')
      .update({ 
        content: editingContent,
        title: editingTitle,
        is_draft: editingDraft
      })
      .eq('id', lessonId)
      .select()
      .single()

    if (error) {
      console.error('Error saving lesson:', error)
      alert('Failed to save lesson: ' + error.message)
    } else {
      setLessons(lessons.map(l => 
        l.id === lessonId ? { ...l, content: editingContent, title: editingTitle, is_draft: editingDraft } : l
      ))
      setEditingLesson(null)
      // Keep the lesson selected to show the saved content
      setSelectedLesson(lessonId)
    }
    setSaving(false)
  }

  async function handleDuplicateLesson(lessonId: string) {
    const lesson = lessons.find(l => l.id === lessonId)
    if (!lesson) return

    // Get all lessons in the same module
    const moduleLessons = lessons
      .filter(l => l.module_id === lesson.module_id)
      .sort((a, b) => a.order_index - b.order_index)

    // Find the index of the current lesson
    const currentIndex = moduleLessons.findIndex(l => l.id === lessonId)
    
    // Insert the duplicate right after the original
    const newOrderIndex = currentIndex + 1

    // Update order indices for lessons that come after
    const updates: { id: string; order_index: number }[] = []
    for (let i = newOrderIndex; i < moduleLessons.length; i++) {
      updates.push({ 
        id: moduleLessons[i].id, 
        order_index: i + 1 
      })
    }

    // Apply updates to database
    for (const update of updates) {
      await supabase
        .from('lessons')
        .update({ order_index: update.order_index })
        .eq('id', update.id)
    }

    // Create the duplicate
    const { data, error } = await supabase
      .from('lessons')
      .insert({
        course_id: courseId,
        module_id: lesson.module_id,
        title: `${lesson.title} (copy)`,
        content: lesson.content,
        order_index: newOrderIndex,
        wistia_video_id: null,
        description: null
      })
      .select()
      .single()

    if (data) {
      // Update local state with new order indices
      const updatedLessons = lessons.map(l => {
        const update = updates.find(u => u.id === l.id)
        if (update) {
          return { ...l, order_index: update.order_index }
        }
        return l
      })
      setLessons([...updatedLessons, data])
    }
  }

  async function handleDeleteLesson(lessonId: string) {
    if (!confirm("Are you sure you want to delete this page?")) return

    const lessonToDelete = lessons.find(l => l.id === lessonId)
    if (!lessonToDelete) return

    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId)

    if (error) {
      console.error('Error deleting lesson:', error)
      alert(`Failed to delete lesson: ${error.message}`)
      return
    }
      // Get remaining lessons in the same module
      const remainingLessons = lessons
        .filter(l => l.id !== lessonId && l.module_id === lessonToDelete.module_id)
        .sort((a, b) => a.order_index - b.order_index)

      // Update order indices for remaining lessons
      const updates: { id: string; order_index: number }[] = []
      remainingLessons.forEach((lesson, index) => {
        if (lesson.order_index !== index) {
          updates.push({ id: lesson.id, order_index: index })
        }
      })

      // Apply updates to database
      for (const update of updates) {
        await supabase
          .from('lessons')
          .update({ order_index: update.order_index })
          .eq('id', update.id)
      }

      // Update local state
      setLessons(lessons.filter(l => l.id !== lessonId).map(lesson => {
        const update = updates.find(u => u.id === lesson.id)
        if (update) {
          return { ...lesson, order_index: update.order_index }
        }
        return lesson
      }))

      // Clear selection if deleted lesson was selected
      if (selectedLesson === lessonId) {
        setSelectedLesson(null)
      }
      if (editingLesson === lessonId) {
        setEditingLesson(null)
      }
  }

  async function handleDeleteModule(moduleId: string) {
    const module = modules.find(m => m.id === moduleId)
    if (!module) return

    // Check if module has lessons
    const moduleLessons = lessons.filter(l => l.module_id === moduleId)
    if (moduleLessons.length > 0) {
      alert("Cannot delete folder with pages. Please move or delete all pages first.")
      return
    }

    if (!confirm(`Are you sure you want to delete the folder "${module.title}"?`)) return

    const { error } = await supabase
      .from('course_modules')
      .delete()
      .eq('id', moduleId)

    if (error) {
      console.error('Error deleting module:', error)
      alert(`Failed to delete folder: ${error.message}`)
    } else {
      setModules(modules.filter(m => m.id !== moduleId))
    }
  }

  async function toggleLessonCompletion(lessonId: string) {
    if (!userId) return

    const isCompleted = completions.some(c => c.lesson_id === lessonId)

    if (isCompleted) {
      // Remove completion
      const { error } = await supabase
        .from('lesson_completions')
        .delete()
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)

      if (!error) {
        setCompletions(completions.filter(c => c.lesson_id !== lessonId))
      }
    } else {
      // Add completion
      const { data, error } = await supabase
        .from('lesson_completions')
        .insert({
          user_id: userId,
          lesson_id: lessonId
        })
        .select()
        .single()

      if (data) {
        setCompletions([...completions, { lesson_id: lessonId, completed_at: data.completed_at }])
      }
    }
  }

  async function handleDeleteCourse() {
    if (!confirm("Are you sure you want to delete this course?")) return

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId)

    if (error) {
      console.error('Error deleting course:', error)
      alert(`Failed to delete course: ${error.message}`)
    } else {
      router.push('/classroom')
    }
  }

  async function toggleModule(moduleId: string) {
    const module = modules.find(m => m.id === moduleId)
    if (!module) return

    const { error } = await supabase
      .from('course_modules')
      .update({ is_collapsed: !module.is_collapsed })
      .eq('id', moduleId)

    if (!error) {
      setModules(modules.map(m => 
        m.id === moduleId ? { ...m, is_collapsed: !m.is_collapsed } : m
      ))
    }
  }

  async function toggleCourseDraft() {
    if (!course) return

    const { error } = await supabase
      .from('courses')
      .update({ is_draft: !course.is_draft })
      .eq('id', courseId)

    if (!error) {
      setCourse({ ...course, is_draft: !course.is_draft })
    }
  }

  const onDragEnd = async (result: any) => {
    if (!result.destination || !isAdmin) return

    const { source, destination, draggableId } = result
    
    // Get the dragged lesson
    const draggedLesson = lessons.find(l => l.id === draggableId)
    if (!draggedLesson) return

    // Check if moved to different module
    const sourceModuleId = source.droppableId === 'root' ? null : source.droppableId
    const destModuleId = destination.droppableId === 'root' ? null : destination.droppableId
    
    // Create new lessons array with updated module_id and order
    const newLessons = [...lessons]
    const lessonIndex = newLessons.findIndex(l => l.id === draggableId)
    
    // Update the lesson's module_id if moved to different module
    if (sourceModuleId !== destModuleId) {
      newLessons[lessonIndex] = {
        ...newLessons[lessonIndex],
        module_id: destModuleId
      }
    }
    
    // Get lessons in source and destination modules
    const sourceLessons = newLessons.filter(l => l.module_id === sourceModuleId && l.id !== draggableId)
    const destLessons = newLessons.filter(l => l.module_id === destModuleId && l.id !== draggableId)
    
    // Insert the dragged lesson at the destination index
    destLessons.splice(destination.index, 0, newLessons[lessonIndex])
    
    // Update order indices for affected lessons
    const updates: { id: string; module_id: string | null; order_index: number }[] = []
    
    // Update order for source module lessons
    sourceLessons.forEach((lesson, index) => {
      updates.push({ id: lesson.id, module_id: lesson.module_id, order_index: index })
    })
    
    // Update order for destination module lessons
    destLessons.forEach((lesson, index) => {
      updates.push({ id: lesson.id, module_id: lesson.module_id, order_index: index })
    })
    
    // Apply updates to state
    const updatedLessons = lessons.map(lesson => {
      const update = updates.find(u => u.id === lesson.id)
      if (update) {
        return { ...lesson, ...update }
      }
      return lesson
    })
    
    setLessons(updatedLessons)

    // Update in database
    for (const update of updates) {
      await supabase
        .from('lessons')
        .update({ 
          module_id: update.module_id,
          order_index: update.order_index 
        })
        .eq('id', update.id)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-8">Loading...</div>
  }

  if (!course) {
    return <div className="flex justify-center py-8">Course not found</div>
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b px-4 md:px-6 py-3">
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/classroom')}
            className="hidden md:flex"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Classroom
          </Button>
          
          {/* Mobile back button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/classroom')}
            className="md:hidden"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-base md:text-lg font-semibold truncate">{course.title}</h1>
          {course.is_draft && isAdmin && (
            <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded hidden sm:inline">
              DRAFT
            </span>
          )}
          <span className="text-sm text-gray-500 ml-auto">
            {lessons.length > 0 
              ? `${Math.round((completions.length / lessons.length) * 100)}%`
              : '0%'
            }
          </span>
        </div>
      </div>

      <div className="relative flex h-[calc(100vh-57px)]">
        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`
          fixed md:relative top-[57px] md:top-0 bottom-0 left-0 z-50 md:z-0
          w-80 bg-white border-r overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          {/* Sidebar Header with Menu */}
          <div className="sticky top-0 bg-white border-b px-4 py-3 z-10 flex justify-between items-center">
            {/* Mobile close button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            
            {isAdmin ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuItem onClick={() => {
                    router.push(`/classroom?edit=${courseId}`)
                  }}>
                    Edit course
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleAddModule}>
                    Add folder
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddLesson()}>
                    Add page
                  </DropdownMenuItem>
                  <div className="my-1 h-px bg-gray-200" />
                  <DropdownMenuItem 
                    onClick={handleDeleteCourse}
                    className="text-red-600"
                  >
                    Delete course
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="w-10" />
            )}
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            {/* Root level droppable */}
            <Droppable droppableId="root">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {lessons
                    .filter(l => !l.module_id)
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((lesson, index) => (
                      <Draggable key={lesson.id} draggableId={lesson.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`
                              group flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer border-l-2
                              ${editingLesson === lesson.id ? 'bg-yellow-50 border-l-yellow-400' : 'border-l-transparent'}
                              ${selectedLesson === lesson.id && !editingLesson ? 'bg-gray-100 border-l-gray-400' : ''}
                              ${snapshot.isDragging ? 'shadow-lg bg-white z-50' : ''}
                            `}
                            onClick={(e) => {
                              // Don't select lesson if clicking on interactive elements
                              if ((e.target as HTMLElement).closest('button, .dropdown-trigger')) return
                              setSelectedLesson(lesson.id)
                              setEditingLesson(null)
                              // Save to cookie
                              Cookies.set(`last-lesson-${courseId}`, lesson.id, { expires: 30 })
                              // Close sidebar on mobile
                              setIsSidebarOpen(false)
                            }}
                          >
                            {isAdmin && (
                              <div {...provided.dragHandleProps}>
                                <GripVertical className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                            <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="flex-1 text-sm">{lesson.title}</span>
                            {lesson.is_draft && isAdmin && (
                              <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded">
                                DRAFT
                              </span>
                            )}
                            
                            {/* 3-dots menu */}
                            {isAdmin && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild className="dropdown-trigger">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                  >
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-36">
                                  <DropdownMenuItem onClick={() => {
                                    setEditingLesson(lesson.id)
                                    setEditingContent(lesson.content || "")
                                    setEditingTitle(lesson.title)
                                    setEditingDraft(lesson.is_draft || false)
                                    setSelectedLesson(lesson.id)
                                  }}>
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDuplicateLesson(lesson.id)}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteLesson(lesson.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* Modules with their own droppable areas */}
            {modules.map((module) => (
              <div key={module.id} className="mt-4">
                <div className="group flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="flex items-center gap-2 flex-1"
                  >
                    {module.is_collapsed ? (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                    <Folder className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">{module.title}</span>
                  </button>
                  
                  {isAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem onClick={() => handleAddLesson(module.id)}>
                          <FileText className="h-4 w-4 mr-2" />
                          Add page to folder
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteModule(module.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete folder
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {!module.is_collapsed && (
                  <Droppable droppableId={module.id}>
                    {(provided, snapshot) => (
                      <div 
                        className={`min-h-[2rem] ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
                        {...provided.droppableProps} 
                        ref={provided.innerRef}
                      >
                        {lessons
                          .filter(l => l.module_id === module.id)
                          .sort((a, b) => a.order_index - b.order_index)
                          .map((lesson, index) => (
                            <Draggable key={lesson.id} draggableId={lesson.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`
                                    group flex items-center gap-2 pl-12 pr-4 py-2 hover:bg-gray-100 cursor-pointer border-l-2
                                    ${editingLesson === lesson.id ? 'bg-yellow-50 border-l-yellow-400' : 'border-l-transparent'}
                                    ${selectedLesson === lesson.id && !editingLesson ? 'bg-gray-100 border-l-gray-400' : ''}
                                    ${snapshot.isDragging ? 'shadow-lg bg-white z-50' : ''}
                                  `}
                                  onClick={(e) => {
                                    // Don't select lesson if clicking on interactive elements
                                    if ((e.target as HTMLElement).closest('button, .dropdown-trigger')) return
                                    setSelectedLesson(lesson.id)
                                    setEditingLesson(null)
                                    // Save to cookie
                                    Cookies.set(`last-lesson-${courseId}`, lesson.id, { expires: 30 })
                                    // Close sidebar on mobile
                                    setIsSidebarOpen(false)
                                  }}
                                >
                                  {isAdmin && (
                                    <div {...provided.dragHandleProps}>
                                      <GripVertical className="h-4 w-4 text-gray-400" />
                                    </div>
                                  )}
                                  <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                  <span className="flex-1 text-sm">{lesson.title}</span>
                                  {lesson.is_draft && isAdmin && (
                                    <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded">
                                      DRAFT
                                    </span>
                                  )}
                                  
                                  {/* 3-dots menu */}
                                  {isAdmin && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild className="dropdown-trigger">
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                        >
                                          <MoreHorizontal className="h-3 w-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => {
                                          setEditingLesson(lesson.id)
                                          setEditingContent(lesson.content || "")
                                          setEditingTitle(lesson.title)
                                          setEditingDraft(lesson.is_draft || false)
                                          setSelectedLesson(lesson.id)
                                        }}>
                                          <Edit2 className="h-4 w-4 mr-2" />
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDuplicateLesson(lesson.id)}>
                                          <Copy className="h-4 w-4 mr-2" />
                                          Duplicate
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => handleDeleteLesson(lesson.id)}
                                          className="text-red-600"
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                        {lessons.filter(l => l.module_id === module.id).length === 0 && (
                          <div className="text-sm text-gray-400 pl-12 py-2">
                            Drop pages here
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                )}
              </div>
            ))}
          </DragDropContext>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white overflow-y-auto">
          {selectedLesson || editingLesson ? (
            <div className="max-w-4xl mx-auto p-4 md:p-8">
              {(() => {
                const currentLesson = lessons.find(l => l.id === (editingLesson || selectedLesson))
                if (!currentLesson) return null

                // Edit mode
                if (editingLesson && isAdmin) {
                  return (
                    <>
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="text-xl sm:text-2xl font-bold mb-4 w-full border-0 outline-none focus:ring-0"
                        placeholder="Page title"
                      />
                      
                      <RichTextEditor
                        content={editingContent}
                        onChange={setEditingContent}
                        placeholder="Start writing..."
                      />
                      
                      <div className="flex items-center justify-end mt-6 pt-6 border-t">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">Published</span>
                            <Switch
                              checked={!editingDraft}
                              onCheckedChange={(checked) => setEditingDraft(!checked)}
                            />
                          </div>
                          
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setEditingLesson(null)
                              setSelectedLesson(currentLesson.id)
                            }}
                          >
                            CANCEL
                          </Button>
                          
                          <Button
                            onClick={() => handleSaveLesson(editingLesson)}
                            disabled={saving}
                          >
                            {saving ? "SAVING..." : "SAVE"}
                          </Button>
                        </div>
                      </div>
                    </>
                  )
                }

                // View mode
                return (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <h1 className="text-2xl sm:text-3xl font-bold">{currentLesson.title}</h1>
                        {currentLesson.is_draft && isAdmin && (
                          <span className="px-2 py-1 text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 rounded">
                            DRAFT
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Progress checkbox */}
                        <button
                          onClick={() => toggleLessonCompletion(currentLesson.id)}
                          className={`
                            flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors
                            ${completions.some(c => c.lesson_id === currentLesson.id) 
                              ? 'bg-green-500 border-green-500' 
                              : 'border-gray-300 hover:border-gray-400'
                            }
                          `}
                        >
                          {completions.some(c => c.lesson_id === currentLesson.id) && (
                            <Check className="h-5 w-5 text-white" />
                          )}
                        </button>
                        
                        {isAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingLesson(currentLesson.id)
                              setEditingContent(currentLesson.content || "")
                              setEditingTitle(currentLesson.title)
                              setEditingDraft(currentLesson.is_draft || false)
                            }}
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <LessonContent content={currentLesson.content || ""} />
                  </>
                )
              })()}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a lesson to view
            </div>
          )}
        </div>
      </div>
    </div>
  )
}