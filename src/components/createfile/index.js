import { registerComponent } from "@utils/knockout";
import template from "./createfile.html?raw";
import { ViewModel } from "./createfile.js";
import "./createfile.scss";

registerComponent("my-createfile", ViewModel, template);