import DashboardLayout from "@/components/DashboardLayout";
import AuthWrapper from "@/components/AuthWrapper";

export default function Home() {
  return (
    <AuthWrapper requireAuth={true}>
      <DashboardLayout />
    </AuthWrapper>
  );
}
