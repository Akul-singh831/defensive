"use client";

import { useAuth } from "@/lib/auth/useAuth";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Syllabus {
  id: string;
  courseId: string;
  teacherId: string;
  content: string;
  objectives?: string;
  textbooks?: string[];
  assessmentMethod?: string;
}

interface Timetable {
  id: string;
  courseId: string;
  sectionCode: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  academicYear: string;
  semester: number;
}

interface CourseDetail {
  id: string;
  code: string;
  name: string;
  credits: number;
  program: string;
  semester: number;
  syllabus?: Syllabus | null;
  timetables?: Timetable[];
}

export default function CourseDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }

    if (!authLoading && courseId) {
      const fetchCourse = async () => {
        try {
          // In a real app, you'd have a single GET endpoint for course details
          // For now, fetch syllabus and timetable separately
          const [syllabusRes, timetableRes] = await Promise.all([
            fetch(`/api/academic/syllabus/${courseId}`, { credentials: "include" }),
            fetch(`/api/academic/timetable/${courseId}`, { credentials: "include" }),
          ]);

          const syllabus = syllabusRes.ok
            ? ((await syllabusRes.json()) as { data: Syllabus }).data
            : null;

          const timetables = timetableRes.ok
            ? ((await timetableRes.json()) as { data: Timetable[] }).data
            : [];

          // Mock course data - in real app, fetch from API
          const mockCourse: CourseDetail = {
            id: courseId,
            code: "CS101",
            name: "Introduction to Computer Science",
            credits: 3,
            program: "Bachelor of Science in Computer Science",
            semester: 1,
            syllabus,
            timetables,
          };

          setCourse(mockCourse);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
          setLoading(false);
        }
      };

      fetchCourse();
    }
  }, [authLoading, user, courseId, router]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Button onClick={() => router.back()} variant="outline" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto py-8">
        <Button onClick={() => router.back()} variant="outline" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <p className="text-gray-600">Course not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button onClick={() => router.back()} variant="outline" className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="max-w-4xl">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">
          {course.name}
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          {course.code} • {course.credits} Credits • Semester {course.semester}
        </p>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {course.syllabus && <TabsTrigger value="syllabus">Syllabus</TabsTrigger>}
            {course.timetables && course.timetables.length > 0 && (
              <TabsTrigger value="timetable">Timetable</TabsTrigger>
            )}
            {user?.role === "student" && <TabsTrigger value="marks">My Marks</TabsTrigger>}
            {user?.role === "student" && <TabsTrigger value="attendance">Attendance</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Program</p>
                  <p className="text-gray-900">{course.program}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Credits</p>
                  <p className="text-gray-900">{course.credits}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {course.syllabus && (
            <TabsContent value="syllabus">
              <Card>
                <CardHeader>
                  <CardTitle>Course Syllabus</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {course.syllabus.objectives && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Learning Objectives</p>
                      <p className="text-gray-900">{course.syllabus.objectives}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-gray-600">Content</p>
                    <p className="text-gray-900 whitespace-pre-wrap">{course.syllabus.content}</p>
                  </div>

                  {course.syllabus.textbooks && course.syllabus.textbooks.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Textbooks</p>
                      <ul className="list-disc list-inside">
                        {course.syllabus.textbooks.map((book, idx) => (
                          <li key={idx} className="text-gray-900">
                            {book}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {course.syllabus.assessmentMethod && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Assessment Method</p>
                      <p className="text-gray-900">{course.syllabus.assessmentMethod}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {course.timetables && course.timetables.length > 0 && (
            <TabsContent value="timetable">
              <Card>
                <CardHeader>
                  <CardTitle>Class Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {course.timetables.map((slot) => (
                      <div
                        key={slot.id}
                        className="p-3 border border-gray-200 rounded-lg flex justify-between items-start"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{slot.dayOfWeek}</p>
                          <p className="text-sm text-gray-600">
                            {slot.startTime} - {slot.endTime}
                          </p>
                          <p className="text-sm text-gray-600">Room: {slot.room}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{slot.sectionCode}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {user?.role === "student" && (
            <>
              <TabsContent value="marks">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Marks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">No marks recorded yet.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="attendance">
                <Card>
                  <CardHeader>
                    <CardTitle>Attendance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Attendance information will appear here.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}
