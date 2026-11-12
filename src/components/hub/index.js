import { registerComponent } from "@utils/knockout";
import template from "./hub.html?raw";
import { ViewModel } from "./hub.js";
import "./hub.scss";

registerComponent("my-hub", ViewModel, template);