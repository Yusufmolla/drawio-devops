import { registerComponent } from "@utils/knockout";
import template from "./menu.html?raw";
import { ViewModel } from "./menu.js";
import "./menu.scss";

registerComponent("my-menu", ViewModel, template);