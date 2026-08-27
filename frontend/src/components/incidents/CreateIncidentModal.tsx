"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { api } from "@/lib/api";
import { Severity } from "@/types";
import { Zap, AlertTriangle } from "lucide-react";

interface CreateIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateIncidentModal: React.FC<CreateIncidentModalProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [service, setService] = React.useState("checkout-service");
  const [severity, setSeverity] = React.useState<Severity>("CRITICAL");
  const [environment, setEnvironment] = React.useState("production-us-east-1");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [description, setDescription] = React.useState("");

  const presets = [
    {
      label: "Checkout 500 DB Pool Exhaustion (Demo Scenario)",
      title: "Checkout Service Connection Pool Exhaustion (>18.4% 500 Spike)",
      service: "checkout-service",
      severity: "CRITICAL" as Severity,
      errorMessage: "sqlalchemy.exc.TimeoutError: QueuePool limit of size 20 overflow 10 reached",
      description: "Triggered after deployment checkout-v2.14.0. Active connections exhausted.",
    },
    {
      label: "Payment Gateway High Latency Spike",
      title: "Payment Authorization P99 Latency Breach (>3500ms)",
      service: "payment-gateway",
      severity: "HIGH" as Severity,
      errorMessage: "HTTP 504 Gateway Timeout on Stripe authorization upstream endpoint",
      description: "Upstream vendor rate-limiting or synchronous socket timeout.",
    },
    {
      label: "Redis Memory Saturation (Cache Eviction)",
      title: "Inventory Sync Redis Memory Saturation (>94%)",
      service: "inventory-sync",
      severity: "MEDIUM" as Severity,
      errorMessage: "OOM command not allowed when used memory > 'maxmemory'",
      description: "Cache keys accumulating without explicit TTL.",
    },
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setTitle(preset.title);
    setService(preset.service);
    setSeverity(preset.severity);
    setErrorMessage(preset.errorMessage);
    setDescription(preset.description);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const newInc = await api.createIncident({
        title,
        service,
        severity,
        environment,
        error_message: errorMessage || null,
        description: description || null,
        source: "OpsForge Simulation Harness",
      });
      onClose();
      router.push(`/incidents/${newInc.id}`);
    } catch (err) {
      console.error("Failed to create incident:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Simulate / Trigger New Incident"
      description="Inject an alert or anomaly into the OpsForge TrueForge agent investigation loop."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Scenario Quick Presets */}
        <div>
          <label className="text-xs font-mono font-medium text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Zap className="h-3.5 w-3.5" />
            Quick Demo Scenario Presets
          </label>
          <div className="grid grid-cols-1 gap-2">
            {presets.map((preset) => (
              <button
                type="button"
                key={preset.label}
                onClick={() => applyPreset(preset)}
                className="text-left p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all text-xs text-slate-300 flex items-center justify-between group"
              >
                <div className="font-medium text-slate-200 group-hover:text-cyan-300">
                  {preset.label}
                </div>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  Load Preset
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Incident Title *</label>
            <Input
              required
              placeholder="e.g. Checkout Service Error Rate Spike > 18.4%"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Target Service</label>
              <Input
                placeholder="checkout-service"
                value={service}
                onChange={(e) => setService(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Severity</label>
              <Select value={severity} onChange={(e) => setSeverity(e.target.value as Severity)}>
                <option value="CRITICAL">CRITICAL (P1)</option>
                <option value="HIGH">HIGH (P2)</option>
                <option value="MEDIUM">MEDIUM (P3)</option>
                <option value="LOW">LOW (P4)</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Environment</label>
              <Select value={environment} onChange={(e) => setEnvironment(e.target.value)}>
                <option value="production-us-east-1">production-us-east-1</option>
                <option value="production-eu-west-1">production-eu-west-1</option>
                <option value="staging-us-west-2">staging-us-west-2</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Error Message / Stacktrace Signature</label>
            <Input
              placeholder="e.g. sqlalchemy.exc.TimeoutError: QueuePool limit of size 20 overflow 10 reached"
              value={errorMessage}
              onChange={(e) => setErrorMessage(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Alert Description & Context</label>
            <Textarea
              placeholder="Describe the initial telemetry trigger or symptoms..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="glow" isLoading={isSubmitting} className="font-mono text-xs">
            <AlertTriangle className="h-3.5 w-3.5" />
            Launch Agent Investigation
          </Button>
        </div>
      </form>
    </Modal>
  );
};
