import { useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";

function Metric({ label, value }: { label: string; value: number }) {
  return <View className="flex-1 bg-surface border border-border rounded-2xl p-4 gap-2 min-w-[125px]">
    <Text className="text-xs text-muted font-semibold uppercase">{label}</Text>
    <Text className="text-3xl font-bold text-foreground">{value}</Text>
  </View>;
}

export default function AutomationControlRoom() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [feedback,setFeedback] = useState("");
  const { data, error, isLoading, isRefetching, refetch } = trpc.admin.automationOverview.useQuery(undefined,{enabled:user?.role==="admin"});
  const utils=trpc.useUtils();
  const probe=trpc.admin.automationProbe.useMutation({
    onSuccess:async result=>{
      setFeedback(result.status==="pending" ? `Synthetic probe queued: ${result.eventId}. Refresh after the next scheduled run to verify completion.` : `Probe status: ${result.status}`);
      await utils.admin.automationOverview.invalidate();
    },
    onError:err=>setFeedback(`Probe failed: ${err.message}`)
  });
  if (authLoading) return <ScreenContainer><ActivityIndicator /></ScreenContainer>;
  if (user?.role!=="admin") return <ScreenContainer><Text className="text-foreground p-6">Access restricted to verified administrators.</Text></ScreenContainer>;
  const c=data?.counts;
  return <ScreenContainer className="p-0">
    <ScrollView contentContainerStyle={{ paddingBottom: 48 }} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={()=>void refetch()} />}>
      <View className="px-6 pt-8 pb-6 gap-3">
        <TouchableOpacity accessibilityRole="button" onPress={()=>router.back()}><Text className="text-primary font-semibold">← Back to Operations</Text></TouchableOpacity>
        <Text className="text-xs font-bold text-primary tracking-wider">LAST BENCH / JEV GATE</Text>
        <Text className="text-3xl font-bold text-foreground">Automation Control Room</Text>
        <Text className="text-sm text-muted">A verified operations console. External CRM writes remain disabled until the production gate passes.</Text>
      </View>
      {isLoading ? <ActivityIndicator className="my-10" /> : error ? <View className="mx-6 p-4 border border-border rounded-xl"><Text className="text-foreground">Unable to read automation source: {error.message}</Text></View> : <>
        <View className="px-6 flex-row flex-wrap gap-3 pb-7">
          <Metric label="Pending" value={Number(c?.pending??0)} />
          <Metric label="Processing" value={Number(c?.processing??0)} />
          <Metric label="Completed" value={Number(c?.completed??0)} />
          <Metric label="Blocked" value={Number(c?.blocked??0)} />
          <Metric label="Dead letters" value={Number(c?.dead_letter??0)} />
        </View>
        <View className="px-6 gap-3 pb-7">
          <Text className="text-xl font-bold text-foreground">Integration Health</Text>
          {(data?.providers??[]).map(p=><View key={p.provider} className="bg-surface border border-border rounded-xl p-4 flex-row justify-between items-center">
            <Text className="text-foreground font-semibold">{p.provider}</Text>
            <Text className="text-muted text-xs font-bold">{p.status.replace("_"," ").toUpperCase()}</Text>
          </View>)}
        </View>
        <View className="px-6 gap-3 pb-7">
          <Text className="text-xl font-bold text-foreground">Workflow Registry</Text>
          {(data?.workflows??[]).map(w=><View key={`${w.id}@${w.version}`} className="bg-surface border border-border rounded-xl p-4 gap-2">
            <View className="flex-row justify-between gap-3"><Text className="text-base font-bold text-foreground flex-1">{w.id}</Text><Text className="text-xs font-semibold text-primary">{w.enabled?"ENABLED":"DISABLED"}</Text></View>
            <Text className="text-xs text-muted">{w.eventType} · v{w.version} · {w.executionMode}</Text>
          </View>)}
        </View>
        <View className="px-6 gap-3 pb-7">
          <Text className="text-xl font-bold text-foreground">Verification</Text>
          <Text className="text-sm text-muted">Inject a synthetic health event, process it through JEV Gate, and confirm its durable result. No real contact is touched.</Text>
          <TouchableOpacity disabled={probe.isPending} accessibilityRole="button" onPress={()=>probe.mutate()} className="bg-primary rounded-xl px-5 py-4 items-center">
            <Text className="text-background font-bold">{probe.isPending?"Running diagnostic…":"Run safe synthetic test"}</Text>
          </TouchableOpacity>
          {Boolean(feedback)&&<Text className="text-sm text-foreground">{feedback}</Text>}
        </View>
        <View className="px-6 gap-3">
          <Text className="text-xl font-bold text-foreground">Recent Executions</Text>
          {(data?.runs??[]).length===0&&<Text className="text-muted">No workflow runs recorded yet.</Text>}
          {(data?.runs??[]).map(run=><View key={run.id} className="border-b border-border py-3 flex-row justify-between gap-3">
            <View className="flex-1 gap-1"><Text className="text-foreground font-semibold">{run.workflowId}</Text><Text className="text-muted text-xs">{new Date(run.startedAt).toLocaleString()} · {run.mode}</Text></View>
            <Text className="text-primary text-xs font-bold">{run.status.toUpperCase()}</Text>
          </View>)}
          <Text className="text-xs text-muted">Source: {data?.verifiedSource} · Last read: {data?.generatedAt?new Date(data.generatedAt).toLocaleString():"—"}</Text>
        </View>
      </>}
    </ScrollView>
  </ScreenContainer>;
}