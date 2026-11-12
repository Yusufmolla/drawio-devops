import { registerComponent } from "@utils/knockout";
import template from "./commit.html?raw";
import { ViewModel } from "./commit.js";
import "./commit.scss";

registerComponent("my-commit", ViewModel, template);