<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>RAaCOS - Profil</title>
        <link rel="stylesheet" href="main.css">
        <link rel="shortcut icon" href="img/logo.ico">
    </head>
    <body>
        <header>
            <a class="logo" href="/"><img src="img/logo.svg" width="150" height="100" alt="RAaCOS"></a>
            <nav>
                <ul class="nav__links">
                    <nav>
                        <div class="dropdown">
                            <li><a href="https://top.gg" target="_BLANK">Voter</a></li>
                            <li><a href="catalogue.php">Catalogue</a></li>
                            <li><a href="stats.php">Stats</a></li>
                            <li><a href="https://discord.gg/VqWkRDaHJP" target="_BLANK">Discord</a></li>
                            <form action="profil.php" method="get" id="search-box" class="search-box">
                                <input placeholder="Profil à rechercher" type="text" name="id" id="searchBar" class="search-txt" required  />
                                <input type="submit" value=">" id="search-btn" class="search-btn" />
                            </form>
                        </div>
                    </nav>
                </ul>
            </nav>
        </header>
        <main>
            <?php
                $chemin = "";

                $files = array_diff(scandir($chemin . "cartes" . "/"), [".", ".."]);
                $files = array_reverse($files);
                foreach ($files as $carte) {
                    echo "<a href='/carte.php?tag=" . str_replace(".json", "", $carte) . "'><img class='imagescartes' src='" . $chemin . "img/cartes/" . str_replace(".json", ".png", $carte) . "'></a>";
                }
            ?>
        </main>
    </body>
    <script>console.log("twitch.tv/draquodrass")</script>
</html>