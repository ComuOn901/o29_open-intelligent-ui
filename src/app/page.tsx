"use client";
import "@openuidev/react-ui/styles/index.css";
import "./shell.css";

import {
  AgentInterface,
  fetchLLM,
  openAIConversationMessageFormat,
  openAIResponsesAdapter,
} from "@openuidev/react-ui";
import type { ActionEvent } from "@openuidev/react-lang";
import { runLibraryAction } from "@/lib/actions";
import { library } from "@/lib/library";
import { responseTheme } from "@/lib/response-theme";

const starters = [
  { displayText: "Plan a day out", prompt: "I'm in San Francisco for a day, plan a sightseeing route for me", icon: null },
  { displayText: "Explore a city", prompt: "Plan a relaxed afternoon exploring Lisbon, with three stops and a map", icon: null },
  { displayText: "Find weekend ideas", prompt: "Help me find a weekend getaway from San Francisco. Compare three destinations", icon: null },
  { displayText: "Plan a meal", prompt: "Help me plan a simple vegetarian dinner for six people", icon: null },
];

const llm = fetchLLM({
  url: "/api/chat",
  streamAdapter: openAIResponsesAdapter(),
  messageFormat: openAIConversationMessageFormat,
});

// The chat sends @ToAssistant and opens @OpenUrl itself; every other action,
// such as the library's @CopyToClipboard, reaches onAction.
function onAction(event: ActionEvent) {
  void runLibraryAction(event);
}

export default function Home() {
  return (
    <div className="chat-shell">
      <AgentInterface
        llm={llm}
        componentLibrary={library}
        onAction={onAction}
        agentName="OpenUI"
        theme={{ mode: "light", lightTheme: responseTheme }}
        starters={starters}
        starterVariant="short"
      >
        <AgentInterface.Welcome title="What can I help with?" />
      </AgentInterface>
    </div>
  );
}
