import { createLibrary } from "@openuidev/react-lang";
import "./components/theme.css";
import "./components/components.css";
import "./components/map/map.css";
import { Chart } from "./components/chart";
import {
  Button,
  Checkbox,
  DatePicker,
  IconButton,
  Input,
  Pressable,
  RadioGroup,
  SegmentedControl,
  Select,
  Slider,
  TextArea,
} from "./components/controls";
import { HtmlView } from "./components/html-view";
import { Box, Card, Col, Divider, Form, Grid, Row, Spacer } from "./components/layout";
import { MapMarker, MapView } from "./components/map/map";
import { Icon, Image } from "./components/media";
import { svgComponents } from "./components/svg";
import { Table } from "./components/table";
import { Badge, Caption, Label, Link, List, ListItem, Markdown, Text, Title } from "./components/text";

/**
 * Primitives the model arranges itself, plus a few widgets for what a model
 * cannot draw (a street map, a sandboxed HTML page). Layout is never fixed here.
 */
export const library = createLibrary({
  root: "Col",
  components: [
    Col, Row, Box, Grid, Card, Divider, Spacer,
    Title, Text, Caption, Label, Badge, Link, List, ListItem, Markdown,
    Button, IconButton, Pressable, Input, TextArea, Select, SegmentedControl, Slider, Checkbox, RadioGroup, DatePicker, Form,
    Icon, Image, Table, Chart, MapView, MapMarker,
    ...svgComponents, HtmlView,
  ],
  componentGroups: [
    {
      name: "Layout",
      components: ["Col", "Row", "Box", "Grid", "Card", "Divider", "Spacer"],
      notes: [
        '- gap and padding count 4px steps. Length is px or a CSS length like "50%". Radius is "sm", "md", "lg", "xl", "full" or px.',
        '- Color is "ink", "muted", "faint", "surface", "info", "success", "warning", "danger", "purple", "pink", "chart1" to "chart6", or a CSS color. As a background, status colors are soft tints.',
      ],
    },
    { name: "Text", components: ["Title", "Text", "Caption", "Label", "Badge", "Link", "List", "ListItem", "Markdown"] },
    {
      name: "Inputs",
      components: ["Button", "IconButton", "Pressable", "Input", "TextArea", "Select", "SegmentedControl", "Slider", "Checkbox", "RadioGroup", "DatePicker", "Form"],
      notes: ["- An input's first argument is its value, usually a $variable that other statements read."],
    },
    { name: "Media and data", components: ["Icon", "Image", "Table", "Chart", "Map", "MapMarker"] },
    { name: "Drawing", components: ["Svg", "G", "Circle", "Ellipse", "Rect", "Line", "Path", "Polyline", "Polygon", "SvgText", "HtmlView"] },
  ],
});

// The CLI (npm run prompt) picks up this export by name.
export { promptOptions } from "./prompt-options";
