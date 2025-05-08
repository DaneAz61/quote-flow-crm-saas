
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface DashboardErrorProps {
  message: string;
}

const DashboardError = ({ message }: DashboardErrorProps) => {
  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Configuration Error</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{message}</p>
        <p className="mt-2 text-sm">
          Please check the .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly.
        </p>
      </CardContent>
    </Card>
  );
};

export default DashboardError;
