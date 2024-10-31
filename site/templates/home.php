<?php snippet("header") ?>

<h1><?php echo $page->title() ?></h1>

<a href="<?= page("projects")->url() ?>"><?= page("projects")->title() ?></a>
<a href="<?= page("texts")->url() ?>"><?= page("texts")->title() ?></a>

<?php snippet("footer") ?>