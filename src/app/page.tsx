"use client";
import "@/lib/devtools";
import "@openuidev/react-ui/styles/index.css";

import {
  AgentInterface,
  fetchLLM,
  openAIConversationMessageFormat,
  openAIResponsesAdapter,
  useThemeModePreference,
} from "@openuidev/react-ui";
import type { ActionEvent } from "@openuidev/react-lang";
import { useEffect } from "react";
import { Brain, Calculator, Compass, Drum, Gamepad2, MapPinned, TentTree, UtensilsCrossed } from "lucide-react";
import { runLibraryAction } from "@/lib/actions";
import { localChatStorage, SaveMessages } from "@/lib/chat-storage";
import { library } from "@/lib/library";

const starters = [
  { displayText: "Plan a day out", prompt: "I'm in San Francisco for a day, plan a sightseeing route for me", icon: <MapPinned size={16} /> },
  { displayText: "Explore a city", prompt: "Plan a relaxed afternoon exploring Lisbon, with three stops and a map", icon: <Compass size={16} /> },
  { displayText: "Find weekend ideas", prompt: "Help me find a weekend getaway from San Francisco. Compare three destinations", icon: <TentTree size={16} /> },
  { displayText: "Plan a meal", prompt: "Help me plan a simple vegetarian dinner for six people", icon: <UtensilsCrossed size={16} /> },
  { displayText: "Build a calculator", prompt: "Build me a working calculator app with a display and keypad", icon: <Calculator size={16} /> },
  { displayText: "Play on a Game Boy", prompt: "Make a playable Game Boy-style handheld game with a screen, D-pad and A/B buttons", icon: <Gamepad2 size={16} /> },
  { displayText: "Jam on a drum pad", prompt: "Make a drum pad I can play, with a few pads and a beat counter", icon: <Drum size={16} /> },
  { displayText: "Take a trivia quiz", prompt: "Quiz me with five fun trivia questions and keep score", icon: <Brain size={16} /> },
];

const llm = fetchLLM({
  url: "/api/chat",
  streamAdapter: openAIResponsesAdapter(),
  messageFormat: openAIConversationMessageFormat,
});

// Threads and messages persist in localStorage (created once, on the client).
const storage = typeof window === "undefined" ? undefined : localChatStorage();

// The chat sends @ToAssistant and opens @OpenUrl itself; every other action,
// such as the library's @CopyToClipboard, reaches onAction.
function onAction(event: ActionEvent) {
  void runLibraryAction(event);
}

export default function Home() {
  // Follows the system theme until the footer toggle is first used, then
  // remembers the choice.
  const { setPreference, mode } = useThemeModePreference();

  // Mirror the resolved mode onto <html>, so the components' dark tokens also
  // apply while the theme follows the system.
  useEffect(() => {
    document.documentElement.setAttribute("data-openui-theme", mode);
  }, [mode]);

  return (
    <div className="chat-shell">
      <AgentInterface
        llm={llm}
        storage={storage}
        componentLibrary={library}
        onAction={onAction}
        agentName="OpenUI"
        logoUrl="/shiro-face.svg"
        theme={{ mode }}
        starters={starters}
      >
        <AgentInterface.SidebarFooter>
          <AgentInterface.ThemeModeToggle mode={mode} onModeChange={setPreference} />
        </AgentInterface.SidebarFooter>
        <AgentInterface.ThreadHeader showChatTitle={false} />
        <AgentInterface.Welcome
          image={<img src="/shiro-woodworker.svg" alt="" className="welcome-mascot" />}
          title="What can I help with?"
          starterVariant="card"
          glowAnimation
        />
        <SaveMessages />
      </AgentInterface>
    </div>
  );
}
