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

                function console_log($output, $with_script_tags = true) {
                    $js_code = 'console.log(' . json_encode($output, JSON_HEX_TAG) . 
                ');';
                    if ($with_script_tags) {
                        $js_code = '<script>' . $js_code . '</script>';
                    }
                    echo $js_code;
                }

                $nom_joueur = explode("#", $_GET['id']);

                $tag_joueur = urldecode($nom_joueur[0]) . "#" . $nom_joueur[1];

                $tagjson = file_get_contents("json/profils.json");
                $tag = json_decode($tagjson, true);

                $id_joueur = $tag[$tag_joueur];

                console_log("Bonjour à toi " . $tag_joueur);

                $mysqli = new mysqli("localhost", "root", "mdpdbsqlDrE884", "raacos");
                $result = $mysqli->query("SELECT * FROM players WHERE id = " . $id_joueur["id"] . ";");        
                
                $row = mysqli_fetch_row($result);

                if(sizeof($result) > 0) {
                    $row[11] = json_decode($row[11], true);
                    $row[10] = json_decode($row[10], true);
                    asort($row[11]);
                    $row[11] = array_reverse($row[11]);
                    echo "<p class='nom_profil'><b>" . $row[2] . "</b></p>";
                    echo "<p class='infos'>Pièces: " . $row[5] . " <p>";
                    echo "<p class='infos'>Poudre: " . $row[6] . " <p>";
                    echo "<p class='infos'>Poudre dorée: " . $row[7] . " <p>";
                    echo "<p class='infos'>Cartes:<p>";
                    foreach ($row[11] as $carte) {
                        echo "<div class='imagescartes'><a href='/carte.php?tag=" . $carte . "'><img class='imagescartes' src='img/cartes/" . $carte . ".png'></a><p>" . $row[10][$carte] . "</p></div>";
                    }
                } else {
                    echo "<p class='err'>Profil introuvable :(</p>";
                }
            ?>
        </main>
    </body>
    <script>console.log("twitch.tv/draquodrass")</script>
</html>