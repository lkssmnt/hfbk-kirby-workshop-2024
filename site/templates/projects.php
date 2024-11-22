<?php snippet("header") ?>

<h1><?= $page->title() ?></h1>

<ul>
  <?php foreach ($page->children() as $projectPage): ?>
    <li>
      <a href="<?= $projectPage->url() ?>">
        <img src="<?= $projectPage->gallery()->first()->toFile()->url() ?>">
      </a>

      <a href="<?= $projectPage->url() ?>">
        <?= $projectPage->title() ?> | <?= $projectPage->author() ?>
      </a>
    </li>
  <?php endforeach ?>
</ul>

<?php snippet("footer") ?>