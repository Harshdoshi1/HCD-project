import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import "./tabs.css";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef((props, ref) => (
    <TabsPrimitive.List
        ref={ref}
        className="tabs-list"
        {...props}
    />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef((props, ref) => (
    <TabsPrimitive.Trigger
        ref={ref}
        className="tabs-trigger"
        {...props}
    />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef((props, ref) => (
    <TabsPrimitive.Content
        ref={ref}
        className="tabs-content"
        {...props}
    />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };