<?php snippet("header") ?>

<h1><?= $page->title() ?></h1>
<h2><?= $page->author() ?></h2>

<div class="images">
  <?php foreach ($page->gallery()->toFiles() as $imageFile): ?>
    <img src="<?= $imageFile->url() ?>">
  <?php endforeach ?>
</div>

<div class="text">
  <?= $page->text() ?>
</div>

<div class="supervision">
  <h3>Supervision</h3>
  <ul>
    <?php foreach ($page->supervision()->toStructure() as $prof): ?>
      <li><?= $prof->name() ?></li>
    <?php endforeach ?>
  </ul>
</div>

<?php snippet("footer") ?>