"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  School,
  Section,
  ShieldCheck,
  UserRound,
  UserRoundPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ValidatedForm } from "@/components/validated-form";
import { AttendanceWorkspace } from "@/components/attendance-workspace";
import { ExamWorkspace } from "@/components/exam-workspace";
import { FeeWorkspace } from "@/components/fee-workspace";
import { NoticeWorkspace } from "@/components/notice-workspace";
import {
  AcademicYearsWorkspace,
  ClassesWorkspace,
  SectionsWorkspace,
  StudentsWorkspace,
  SubjectsWorkspace,
  TeachersWorkspace,
  UsersWorkspace,
} from "@/components/module-workspaces";
import { getApiErrorMessage } from "@/lib/api-client";
import {
  useCurrentUser,
  useLogin,
  useLogout,
  useRegister,
} from "@/modules/auth/hooks";
import type { AuthUser } from "@/modules/auth/service";
import { loginSchema, registerSchema } from "@/modules/auth/schemas";
import { usePublicNotices } from "@/modules/notices/hooks";
import { useStudents } from "@/modules/students/hooks";
import { useTeachers } from "@/modules/teachers/hooks";
import { useFeeCollections } from "@/modules/fees/hooks";
import { useExams } from "@/modules/exams/hooks";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export type ViewId =
  | "overview"
  | "students"
  | "attendance"
  | "fees"
  | "exams"
  | "notices"
  | "teachers"
  | "classes"
  | "sections"
  | "subjects"
  | "academic-years"
  | "users";
type NavItem = {
  id: ViewId;
  label: string;
  icon: LucideIcon;
  roles: AuthUser["role"][];
};

const navItems: NavItem[] = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    roles: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
  },
  { id: "students", label: "Students", icon: GraduationCap, roles: ["ADMIN"] },
  {
    id: "attendance",
    label: "Attendance",
    icon: ClipboardCheck,
    roles: ["ADMIN", "TEACHER"],
  },
  { id: "fees", label: "Fees & payments", icon: CreditCard, roles: ["ADMIN"] },
  {
    id: "exams",
    label: "Exams & results",
    icon: BookOpen,
    roles: ["ADMIN", "TEACHER", "STUDENT"],
  },
  {
    id: "notices",
    label: "Notice board",
    icon: Bell,
    roles: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
  },
  { id: "teachers", label: "Teachers", icon: UserRound, roles: ["ADMIN"] },
  { id: "classes", label: "Classes", icon: School, roles: ["ADMIN"] },
  { id: "sections", label: "Sections", icon: Section, roles: ["ADMIN"] },
  { id: "subjects", label: "Subjects", icon: BookOpen, roles: ["ADMIN"] },
  {
    id: "academic-years",
    label: "Academic years",
    icon: CalendarDays,
    roles: ["ADMIN"],
  },
  { id: "users", label: "Users & access", icon: ShieldCheck, roles: ["ADMIN"] },
];

export function InstituteDashboard() {
  const currentUser = useCurrentUser();
  if (currentUser.isPending)
    return (
      <div className="app-loading">
        <span className="loader" />
        Connecting to institute workspace
      </div>
    );
  if (currentUser.isError) {
    const status = axios.isAxiosError(currentUser.error)
      ? currentUser.error.response?.status
      : undefined;
    if (status === 401) return <AuthScreen />;
    return (
      <div className="app-loading" role="alert">
        <span>
          Could not verify your session. Check the connection and retry.
        </span>
        <Button variant="outline" onClick={() => currentUser.refetch()}>
          Retry
        </Button>
      </div>
    );
  }
  if (!currentUser.data) return <AuthScreen />;
  return <Workspace user={currentUser.data} />;
}

function AuthScreen() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const login = useLogin();
  const register = useRegister();
  const mutation = mode === "login" ? login : register;
  const fields =
    mode === "login"
      ? [
          { name: "email", label: "Email address", type: "email" as const },
          { name: "password", label: "Password", type: "password" as const },
        ]
      : [
          { name: "name", label: "Full name" },
          { name: "email", label: "Email address", type: "email" as const },
          { name: "phone", label: "Phone" },
          { name: "password", label: "Password", type: "password" as const },
          {
            name: "role",
            label: "Account type",
            type: "select" as const,
            options: [
              { value: "STUDENT", label: "Student" },
              { value: "PARENT", label: "Parent" },
            ],
          },
        ];
  return (
    <main className="auth-screen">
      <div className="auth-aside">
        <div className="brand-lockup">
          <span className="brand-mark">
            <School size={21} />
          </span>
          <span>
            CEDAR <small>INSTITUTE</small>
          </span>
        </div>
        <div className="auth-copy">
          <p className="eyebrow">CAMPUS OPERATIONS</p>
          <h1>
            Every school day,
            <br />
            <em>in good order.</em>
          </h1>
          <p>
            One workspace for learning, attendance, fees, and the people who
            keep it all moving.
          </p>
        </div>
        <div className="auth-aside-footer">
          <span>ACADEMIC YEAR 2026–27</span>
          <span>EST. 1998</span>
        </div>
      </div>
      <section className="auth-panel">
        <div className="auth-panel-inner">
          <p className="eyebrow">
            {mode === "login" ? "WELCOME BACK" : "JOIN THE COMMUNITY"}
          </p>
          <h2>
            {mode === "login" ? "Sign in to continue" : "Create an account"}
          </h2>
          <p className="auth-subtitle">
            {mode === "login"
              ? "Use your institute account to access your workspace."
              : "Student and parent accounts can register here."}
          </p>
          <div className="segmented-control auth-tabs">
            <button
              className={mode === "login" ? "selected" : ""}
              onClick={() => setMode("login")}
            >
              Sign in
            </button>
            <button
              className={mode === "register" ? "selected" : ""}
              onClick={() => setMode("register")}
            >
              Register
            </button>
          </div>
          <ValidatedForm
            schema={mode === "login" ? loginSchema : registerSchema}
            fields={fields}
            submitLabel={mode === "login" ? "Sign in" : "Create account"}
            onSubmit={(value) => mutation.mutateAsync(value as never)}
          />
          {mutation.isError && (
            <div className="notice notice-error">
              {getApiErrorMessage(mutation.error)}
            </div>
          )}
          <div className="auth-footnote">
            <ShieldCheck size={16} /> Secure sign-in · HttpOnly session cookie
          </div>
        </div>
      </section>
    </main>
  );
}

function Workspace({ user }: { user: AuthUser }) {
  const logout = useLogout();
  const router = useRouter();
  const pathname = usePathname();
  const routeView = pathname === "/" ? "overview" : pathname.slice(1);
  const visibleItems = navItems.filter((item) =>
    item.roles.includes(user.role),
  );
  const hasRouteAccess = visibleItems.some((item) => item.id === routeView);
  const activeView: ViewId = hasRouteAccess
    ? (routeView as ViewId)
    : "overview";
  const active =
    visibleItems.find((item) => item.id === activeView) ?? visibleItems[0];

  useEffect(() => {
    if (pathname !== "/" && !hasRouteAccess) router.replace("/");
  }, [hasRouteAccess, pathname, router]);

  async function signOut() {
    await logout.mutateAsync();
    router.refresh();
  }

  function navigate(view: ViewId) {
    router.push(view === "overview" ? "/" : `/${view}`);
  }

  return (
    <SidebarProvider className="min-h-svh w-full" defaultOpen>
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader className="px-4 py-5">
          <div className="brand-lockup sidebar-brand">
            <span className="brand-mark">
              <School size={20} />
            </span>
            <span>
              CEDAR <small>INSTITUTE</small>
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarMenu>
              {visibleItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      render={
                        <Link
                          href={item.id === "overview" ? "/" : `/${item.id}`}
                        />
                      }
                      isActive={activeView === item.id}
                      tooltip={item.label}
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="gap-3 p-3">
          <div className="current-year sidebar-year">
            <CalendarDays size={15} />
            <span>Academic year</span>
            <strong>2026–27</strong>
          </div>
          <Button variant="ghost" className="justify-start" onClick={signOut}>
            <LogOut size={16} />
            <span>{logout.isPending ? "Signing out…" : "Sign out"}</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="workspace-main min-w-0">
        <header className="topbar">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-5" />
            <div className="breadcrumb">
              <span>Workspace</span>
              <span className="crumb-divider">/</span>
              <strong>{active.label}</strong>
            </div>
          </div>
          <div className="topbar-right">
            <span className="date-stamp">
              {new Intl.DateTimeFormat("en", {
                weekday: "short",
                day: "numeric",
                month: "short",
              }).format(new Date())}
            </span>
            <span className="user-avatar">
              {user.name
                .split(" ")
                .map((word) => word[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </span>
            <div className="user-summary">
              <strong>{user.name}</strong>
              <span>{roleLabel(user.role)}</span>
            </div>
            <ChevronDown size={15} className="user-chevron" />
          </div>
        </header>
        <main className="page-content">
          {activeView === "overview" && (
            <Overview user={user} onNavigate={navigate} />
          )}
          {activeView === "students" && <StudentsWorkspace />}
          {activeView === "attendance" && <AttendanceWorkspace />}
          {activeView === "fees" && (
            <FeeWorkspace canManage={user.role === "ADMIN"} />
          )}
          {activeView === "exams" && (
            <ExamWorkspace
              canManage={user.role !== "STUDENT"}
              isStudent={user.role === "STUDENT"}
            />
          )}
          {activeView === "notices" && (
            <NoticeWorkspace canManage={user.role === "ADMIN"} />
          )}
          {activeView === "teachers" && <TeachersWorkspace />}
          {activeView === "classes" && <ClassesWorkspace />}
          {activeView === "sections" && <SectionsWorkspace />}
          {activeView === "subjects" && <SubjectsWorkspace />}
          {activeView === "academic-years" && <AcademicYearsWorkspace />}
          {activeView === "users" && <UsersWorkspace />}
        </main>
        <footer className="workspace-footer">
          <span>CEDAR INSTITUTE MANAGEMENT</span>
          <span>
            Connected workspace <i />
          </span>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}

function roleLabel(role: AuthUser["role"]) {
  return (
    {
      ADMIN: "Administrator",
      TEACHER: "Teacher",
      STUDENT: "Student",
      PARENT: "Parent",
    } as const
  )[role];
}

function Overview({
  user,
  onNavigate,
}: {
  user: AuthUser;
  onNavigate: (view: ViewId) => void;
}) {
  if (user.role === "ADMIN") return <AdminOverview onNavigate={onNavigate} />;
  if (user.role === "TEACHER") return <StaffOverview onNavigate={onNavigate} />;
  return <CommunityOverview user={user} onNavigate={onNavigate} />;
}

function AdminOverview({ onNavigate }: { onNavigate: (view: ViewId) => void }) {
  const students = useStudents();
  const teachers = useTeachers();
  const fees = useFeeCollections();
  const exams = useExams();
  const notices = usePublicNotices();
  return (
    <div className="overview-page">
      <div className="overview-heading">
        <div>
          <p className="eyebrow">MONDAY · CAMPUS BRIEFING</p>
          <h1>Good morning.</h1>
          <p>Here’s the institute at a glance.</p>
        </div>
        <button
          className="button button-primary"
          onClick={() => onNavigate("students")}
        >
          <UserRoundPlus size={16} /> Admit student
        </button>
      </div>
      <div className="stat-grid">
        <Stat
          icon={GraduationCap}
          label="Active students"
          value={students.data?.pagination.total ?? "—"}
          note="enrolled profiles"
          tone="mint"
        />
        <Stat
          icon={UserRound}
          label="Teaching staff"
          value={teachers.data?.pagination.total ?? "—"}
          note="active profiles"
          tone="gold"
        />
        <Stat
          icon={CreditCard}
          label="Fee receipts"
          value={fees.data?.pagination.total ?? "—"}
          note="recorded collections"
          tone="rose"
        />
        <Stat
          icon={BookOpen}
          label="Exams"
          value={exams.data?.pagination.total ?? "—"}
          note="scheduled"
          tone="blue"
        />
      </div>
      <div className="overview-lower">
        <section className="quick-actions">
          <div className="section-heading">
            <div>
              <p className="eyebrow">SHORTCUTS</p>
              <h2>Today’s work</h2>
            </div>
          </div>
          <div className="shortcut-list">
            <QuickAction
              icon={UserRoundPlus}
              label="Register a student"
              detail="Profile and enrollment"
              onClick={() => onNavigate("students")}
            />
            <QuickAction
              icon={ClipboardCheck}
              label="Mark attendance"
              detail="Load a class roster"
              onClick={() => onNavigate("attendance")}
            />
            <QuickAction
              icon={CreditCard}
              label="Collect a fee"
              detail="Search student balance"
              onClick={() => onNavigate("fees")}
            />
            <QuickAction
              icon={BookOpen}
              label="Enter exam marks"
              detail="Results and assessment"
              onClick={() => onNavigate("exams")}
            />
          </div>
        </section>
        <section className="overview-notices">
          <div className="section-heading">
            <div>
              <p className="eyebrow">BULLETIN</p>
              <h2>Recent notices</h2>
            </div>
            <button
              className="text-button"
              onClick={() => onNavigate("notices")}
            >
              All notices
            </button>
          </div>
          {notices.data?.data.slice(0, 3).map((notice) => (
            <article className="brief-notice" key={notice.id}>
              <time>{new Date(notice.publishDate).toLocaleDateString()}</time>
              <h3>{notice.title}</h3>
              <p>{notice.description}</p>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}

function StaffOverview({ onNavigate }: { onNavigate: (view: ViewId) => void }) {
  const exams = useExams();
  const notices = usePublicNotices();
  return (
    <div className="overview-page">
      <div className="overview-heading">
        <div>
          <p className="eyebrow">TEACHING DESK</p>
          <h1>Your classroom, in focus.</h1>
          <p>Attendance, assessment, and school updates in one place.</p>
        </div>
      </div>
      <div className="stat-grid stat-grid-staff">
        <Stat
          icon={BookOpen}
          label="Scheduled exams"
          value={exams.data?.pagination.total ?? "—"}
          note="school-wide"
          tone="blue"
        />
        <Stat
          icon={Bell}
          label="New notices"
          value={notices.data?.data.length ?? "—"}
          note="published updates"
          tone="gold"
        />
        <Stat
          icon={Activity}
          label="Quick task"
          value="Attendance"
          note="open class register"
          tone="mint"
        />
      </div>
      <div className="shortcut-list staff-shortcuts">
        <QuickAction
          icon={ClipboardCheck}
          label="Mark attendance"
          detail="Select date, class, section"
          onClick={() => onNavigate("attendance")}
        />
        <QuickAction
          icon={BookOpen}
          label="Exam results"
          detail="Review class performance"
          onClick={() => onNavigate("exams")}
        />
        <QuickAction
          icon={Bell}
          label="Notice board"
          detail="Institute announcements"
          onClick={() => onNavigate("notices")}
        />
      </div>
    </div>
  );
}

function CommunityOverview({
  user,
  onNavigate,
}: {
  user: AuthUser;
  onNavigate: (view: ViewId) => void;
}) {
  const notices = usePublicNotices();
  return (
    <div className="overview-page">
      <div className="overview-heading">
        <div>
          <p className="eyebrow">CEDAR INSTITUTE</p>
          <h1>Welcome, {user.name.split(" ")[0]}.</h1>
          <p>Your institute updates are ready.</p>
        </div>
      </div>
      <div className="community-actions">
        <button
          className="community-action"
          onClick={() => onNavigate("notices")}
        >
          <Bell size={21} />
          <span>Notice board</span>
          <small>Latest institute announcements</small>
        </button>
        {user.role === "STUDENT" && (
          <button
            className="community-action"
            onClick={() => onNavigate("exams")}
          >
            <BookOpen size={21} />
            <span>Exam results</span>
            <small>View your calculated result</small>
          </button>
        )}
      </div>
      <div className="notice-board compact-notices">
        {notices.data?.data.slice(0, 4).map((notice) => (
          <article className="notice-item" key={notice.id}>
            <div className="notice-date">
              {new Date(notice.publishDate).toLocaleDateString()}
            </div>
            <div>
              <h3>{notice.title}</h3>
              <p>{notice.description}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  note,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  note: string;
  tone: string;
}) {
  return (
    <article className={`stat-card tone-${tone}`}>
      <div className="stat-top">
        <span>{label}</span>
        <Icon size={18} />
      </div>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}
function QuickAction({
  icon: Icon,
  label,
  detail,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button className="quick-action" onClick={onClick}>
      <span className="quick-icon">
        <Icon size={18} />
      </span>
      <span className="quick-copy">
        <strong>{label}</strong>
        <small>{detail}</small>
      </span>
      <span className="quick-arrow">↗</span>
    </button>
  );
}
