<?php snippet("header") ?>

<h1>Texts</h1>

<ul>
  <?php foreach ($page->children() as $textPage): ?>
    <li>
      <a href="<?= $textPage->url() ?>"><?= $textPage->title() ?></a>
    </li>
  <?php endforeach ?>
</ul>

<?php snippet("footer") ?>