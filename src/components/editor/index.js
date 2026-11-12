import { registerComponent } from "@utils/knockout";
import template from "./editor.html?raw";
import { ViewModel } from "./editor.js";
import "./editor.scss";

registerComponent("my-editor", ViewModel, template);