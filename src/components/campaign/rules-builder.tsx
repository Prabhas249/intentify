"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface TriggerRule {
  field: string;
  operator: string;
  value: string | number;
}

interface RulesBuilderProps {
  rules: TriggerRule[];
  operator: "AND" | "OR";
  onRulesChange: (rules: TriggerRule[]) => void;
  onOperatorChange: (operator: "AND" | "OR") => void;
}

const fieldOptions = [
  {
    value: "visitCount",
    label: "Visit Count",
    description: "Number of times visitor has visited",
    type: "number",
  },
  {
    value: "intentScore",
    label: "Intent Score",
    description: "Calculated engagement score (0-100)",
    type: "number",
  },
  {
    value: "intentLevel",
    label: "Intent Level",
    description: "LOW, MEDIUM, or HIGH",
    type: "select",
    options: ["low", "medium", "high"],
  },
  {
    value: "page",
    label: "Current Page",
    description: "URL path visitor is on",
    type: "text",
  },
  {
    value: "utmSource",
    label: "UTM Source",
    description: "Traffic source (google, instagram, etc.)",
    type: "text",
  },
  {
    value: "referrer",
    label: "Referrer",
    description: "Where visitor came from",
    type: "text",
  },
  {
    value: "device",
    label: "Device",
    description: "mobile or desktop",
    type: "select",
    options: ["mobile", "desktop"],
  },
];

const operatorsByType: Record<string, { value: string; label: string }[]> = {
  number: [
    { value: "eq", label: "equals" },
    { value: "neq", label: "not equals" },
    { value: "gt", label: "greater than" },
    { value: "lt", label: "less than" },
    { value: "gte", label: "greater than or equal" },
    { value: "lte", label: "less than or equal" },
  ],
  text: [
    { value: "equals", label: "equals" },
    { value: "not_equals", label: "not equals" },
    { value: "contains", label: "contains" },
    { value: "not_contains", label: "does not contain" },
    { value: "starts_with", label: "starts with" },
    { value: "is_empty", label: "is empty" },
    { value: "is_not_empty", label: "is not empty" },
  ],
  select: [
    { value: "equals", label: "equals" },
    { value: "not_equals", label: "not equals" },
  ],
};

export function RulesBuilder({
  rules,
  operator,
  onRulesChange,
  onOperatorChange,
}: RulesBuilderProps) {
  const addRule = () => {
    onRulesChange([
      ...rules,
      { field: "visitCount", operator: "gt", value: 1 },
    ]);
  };

  const updateRule = (index: number, field: keyof TriggerRule, value: string | number) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], [field]: value };

    // Reset operator and value when field changes
    if (field === "field") {
      const fieldConfig = fieldOptions.find((f) => f.value === value);
      if (fieldConfig) {
        const defaultOp = operatorsByType[fieldConfig.type][0].value;
        newRules[index].operator = defaultOp;
        newRules[index].value = fieldConfig.type === "number" ? 0 : "";
      }
    }

    onRulesChange(newRules);
  };

  const removeRule = (index: number) => {
    onRulesChange(rules.filter((_, i) => i !== index));
  };

  const getFieldConfig = (fieldValue: string) => {
    return fieldOptions.find((f) => f.value === fieldValue);
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Operator Toggle */}
        {rules.length > 1 && (
          <div className="flex items-center gap-2">
            <Label className="text-sm">Match</Label>
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                type="button"
                variant={operator === "AND" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onOperatorChange("AND")}
              >
                ALL rules (AND)
              </Button>
              <Button
                type="button"
                variant={operator === "OR" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onOperatorChange("OR")}
              >
                ANY rule (OR)
              </Button>
            </div>
          </div>
        )}

        {/* Rules List */}
        {rules.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">
              No rules added. Popup will show to all visitors.
            </p>
            <Button type="button" variant="outline" onClick={addRule}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Rule
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule, index) => {
              const fieldConfig = getFieldConfig(rule.field);
              const fieldType = fieldConfig?.type || "text";
              const operators = operatorsByType[fieldType] || operatorsByType.text;
              const showValueInput = !["is_empty", "is_not_empty"].includes(
                rule.operator
              );

              return (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg"
                >
                  {index > 0 && (
                    <Badge variant="outline" className="mt-2 shrink-0">
                      {operator}
                    </Badge>
                  )}

                  <div className="flex-1 grid grid-cols-3 gap-2">
                    {/* Field Select */}
                    <div className="space-y-1">
                      <Label className="text-xs">Field</Label>
                      <Select
                        value={rule.field}
                        onValueChange={(v) => updateRule(index, "field", v)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldOptions.map((field) => (
                            <SelectItem key={field.value} value={field.value}>
                              <div className="flex items-center gap-2">
                                {field.label}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-3 w-3 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {field.description}
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Operator Select */}
                    <div className="space-y-1">
                      <Label className="text-xs">Condition</Label>
                      <Select
                        value={rule.operator}
                        onValueChange={(v) => updateRule(index, "operator", v)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {operators.map((op) => (
                            <SelectItem key={op.value} value={op.value}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Value Input */}
                    <div className="space-y-1">
                      <Label className="text-xs">Value</Label>
                      {!showValueInput ? (
                        <div className="h-9 flex items-center text-sm text-muted-foreground">
                          (no value needed)
                        </div>
                      ) : fieldConfig?.type === "select" &&
                        fieldConfig.options ? (
                        <Select
                          value={String(rule.value)}
                          onValueChange={(v) => updateRule(index, "value", v)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fieldConfig.options.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : fieldConfig?.type === "number" ? (
                        <Input
                          type="number"
                          className="h-9"
                          value={rule.value}
                          onChange={(e) =>
                            updateRule(
                              index,
                              "value",
                              parseInt(e.target.value) || 0
                            )
                          }
                        />
                      ) : (
                        <Input
                          type="text"
                          className="h-9"
                          placeholder="Enter value..."
                          value={rule.value}
                          onChange={(e) =>
                            updateRule(index, "value", e.target.value)
                          }
                        />
                      )}
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 mt-6 text-muted-foreground hover:text-red-500"
                    onClick={() => removeRule(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Rule Button */}
        {rules.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addRule}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Rule
          </Button>
        )}

        {/* Example Rules */}
        <div className="pt-4 border-t">
          <Label className="text-sm mb-2 block">Quick Examples</Label>
          <div className="flex flex-wrap gap-2">
            {[
              {
                label: "Return visitors",
                rules: [{ field: "visitCount", operator: "gt", value: 1 }],
              },
              {
                label: "High intent",
                rules: [{ field: "intentLevel", operator: "equals", value: "high" }],
              },
              {
                label: "From Instagram",
                rules: [{ field: "utmSource", operator: "equals", value: "instagram" }],
              },
              {
                label: "On pricing page",
                rules: [{ field: "page", operator: "contains", value: "/pricing" }],
              },
              {
                label: "Mobile users",
                rules: [{ field: "device", operator: "equals", value: "mobile" }],
              },
            ].map((example) => (
              <Badge
                key={example.label}
                variant="outline"
                className="cursor-pointer hover:bg-muted"
                onClick={() => onRulesChange([...rules, ...example.rules])}
              >
                <Plus className="h-3 w-3 mr-1" />
                {example.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
