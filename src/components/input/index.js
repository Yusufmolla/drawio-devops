import { registerComponent } from "@utils/knockout";
import template from "./input.html?raw";
import { ViewModel } from "./input.js";
import "./input.scss";
import "@bindings/autoselect";
import "@bindings/autofocus";
import "@bindings/enter";

registerComponent("my-input", ViewModel, template);