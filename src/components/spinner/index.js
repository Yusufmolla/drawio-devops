import { registerComponent } from "@utils/knockout";
import template from "./spinner.html?raw";
import { ViewModel } from "./spinner.js";
import "./spinner.scss";

registerComponent("my-spinner", ViewModel, template);