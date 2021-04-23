import ImageResource from "./sleek/resources/ImageResource";
import Resources from "./sleek/resources/Resources";
import SoundResource from "./sleek/resources/SoundResource";
import ZipResource from "./sleek/resources/ZipResource";

export let WRONG: SoundResource;
export let RIGHT: SoundResource;
export let LEVEL: SoundResource;
export let NEXT: SoundResource;
export let CLICK: SoundResource;
export let LOGO: ImageResource;

Resources.onZipLoadingComplete = (ZIP: ZipResource) => {
  WRONG = ZIP.getMp3("sounds/wrong.mp3");
  RIGHT = ZIP.getMp3("sounds/right.mp3");
  LEVEL = ZIP.getMp3("sounds/level.mp3");
  NEXT = ZIP.getMp3("sounds/next.mp3");
  CLICK = ZIP.getMp3("sounds/click.mp3");

  LOGO = ZIP.getPng("img/cc.png")
}